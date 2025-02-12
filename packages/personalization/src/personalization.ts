import { CalculateAudiences } from "./audiences";
import { IManifestClientArgs, Manifest } from "./providers/manifest";
import {
  AppOverrideSignals,
  AppSignals,
  IHandlers,
  IManifest,
  IPersonalizationStore,
} from "./models";
import { CalculateSignals } from "./signals";
import { IStoreOptions, Store } from "./providers/store";
import {
  isArray,
  isSSR,
  isStore,
  now,
  objectKeys,
  objectMatches,
  stringify,
} from "./util";
import { logger, messages } from "./logs";
import { Session } from "./session";

/** Global context object name */
export const GLOBAL = "CONTENSIS_PERSONALIZATION";

export type PersonalizationContextOptions = {
  client?: IManifestClientArgs | undefined;
  debug?: PersonalizationContext["debug"];
  handlers?: Partial<IHandlers>;
  manifest?: IManifest;
  session?: true;
};

// /** User-supplied event handlers */
// type IHandlers = {
//   /** onInit event handler, called when the context is initialized */
//   onInit: (context: PersonalizationContext) => void;
//   /** onNavigate event handler, called when client-side navigation has been detected */
//   onNavigate: (
//     context: PersonalizationContext,
//     current: string,
//     previous?: string
//   ) => void;
//   /** onPageView event handler, called when a pageView has been registered and signals have been calculated */
//   onPageView: (
//     context: PersonalizationContext,
//     current: string,
//     previous?: string
//   ) => void;
//   /** onManifestReady event handler, called when a manifest has been loaded and signals have been calculated */
//   onManifestReady: (
//     context: PersonalizationContext,
//     manifest: IManifest
//   ) => void;
//   /** onComputed event handler, called when signals and audiences have been calculated */
//   onComputed: (context: PersonalizationContext) => void;
// };

type PageView = [string, Date, CalculateSignals | null];

export class PersonalizationContext {
  static Store = Store;

  #store: Store;
  #events: [keyof IHandlers, IHandlers[keyof IHandlers]][] = [];
  /** Output console.log messaging, true or v=verbose */
  debug: boolean | "v";
  cpid: string;
  percentile: number;
  audiences?: CalculateAudiences;
  currentPage: string = "";
  previousPage?: string;
  session!: Session;
  signals?: CalculateSignals;
  manifest?: Manifest;
  pageViews: PageView[] = [];
  app?: AppSignals;
  t = 0;

  // handlers: IHandlers = {
  //   onInit: () => {},
  //   onNavigate: () => {},
  //   onPageView: () => {},
  //   onManifestReady: () => {},
  //   onComputed: () => {},
  // };
  log?: typeof logger;

  addHandler = <T extends keyof IHandlers>(key: T, callback: IHandlers[T]) => {
    this.#events.push([key, callback]);
    return callback;
  };

  removeHandler = <T extends keyof IHandlers>(
    key: T,
    callback: IHandlers[T]
  ) => {
    this.#events = this.#events.filter(
      (e) => e[0] !== key || e[1] !== callback
    );
  };

  #handler = <T extends keyof IHandlers>(
    key: T,
    ...args: Parameters<IHandlers[T]>
  ) => {
    for (const [evt, cb] of this.#events.filter((e) => e[0] === key)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cb as any)(...args);
    }
  };

  /** Log a debug message */
  l = (message: keyof typeof messages, ...values: unknown[]) => {
    if (this.debug)
      if (this.log) this.log(message, ...values);
      else {
        // Verbose messaging will output raw console.logs synchronously
        // before the logging bundle has finished async loading so the timing
        // of events can be accurately observed
        if (this.debug == "v") console.log("cp", message, values);
        this.#logs(true)
          .then(() => this.l(message, ...values))
          .catch(() => {
            console.log("cp", message, values);
          });
      }
  };

  compute = (pageView = this.#cpv) => {
    // Ensure our session is up to date before calculating signals
    this.session.update();

    // Have we already computed signals for this pageView?
    const existing = pageView?.[2];

    // Compute signals
    const signals = (this.signals = !existing
      ? new CalculateSignals(this)
      : existing.redo());

    // Persist current signals state
    this.#save = {
      ...this.state,
      signals: signals.state,
    };

    // Add signal state to pageViews array so we know it does not require recalculation
    if (pageView) pageView[2] = signals;

    // Determine audiences, evaluate conditions
    const audiences = (this.audiences = new CalculateAudiences(this));

    // Persist current audiences state
    this.#save = {
      ...this.state,
      audiences: audiences.state,
    };
    this.session.update();
    this.t = now();

    // const { handlers } = this;
    // handlers.onComputed(this);
    this.#handler("onComputed", this);
  };

  #init = () => {
    if (isSSR()) return;

    this.#observe();

    // const { handlers } = this;
    // handlers.onInit(this);
    this.#handler("onInit", this);
  };

  #logs = async (debug?: boolean) =>
    debug && !this.log
      ? // Dynamically import logging if we have set debug flag
        import("./logs").then(({ logger }) => {
          this.log = logger;
        })
      : void 0;

  /** Monitor for DOM mutations and subsequent href changes */
  #observe = () => {
    let lastHref = "";
    const observer = new MutationObserver(() => {
      const { currentPage, l, page } = this;
      // If page has changed (or is initial page load)
      if (page !== lastHref) {
        // Log the page view (debug only)
        if (!lastHref) l("n1", page);
        else l("n2", currentPage, page);
        lastHref = page;
        // Record the page view
        this.pageView();

        // Call navigate handler
        // handlers.onNavigate(this, page, lastHref);
        this.#handler("onNavigate", this, page, lastHref);
      }
    });

    const bodyEl = document.querySelector("body");

    observer.observe(bodyEl!, {
      childList: true,
      subtree: true,
    });
  };

  #onManifestReady = (manifest: IManifest) => {
    const { l, pageViews, state } = this;

    // Should we update location attributes from the manifest to the session?
    const stateLocation = state.manifest?.location;
    const manifestLocation = manifest?.location;
    const updateLocation = !objectMatches(stateLocation, manifestLocation);

    if (updateLocation) {
      this.session.update({ location: manifestLocation });
      l("ml", manifestLocation, stateLocation);
    }

    const stateVersion = state.manifest?.version.versionNo;
    const manifestVersion = manifest?.version.versionNo;

    if (
      updateLocation ||
      (manifestVersion && manifestVersion !== stateVersion) ||
      manifestVersion === "draft" ||
      !manifestVersion
    ) {
      // Save the new manifest
      this.#save = { ...state, manifest };
      l("mv", manifestVersion, stateVersion);

      // // Retrospectively calculate signals for any pageViews[][2] that are null
      // const toCheck = pageViews.filter((pv) => pv[2] === null);
      // for (const pageView of toCheck) {

      // Recompute all pageViews when manifest is updated
      for (const pageView of pageViews) {
        const existingSignals = this.signals?.matched?.length || 0;
        const existingAudiences = this.audiences?.active.length || 0;

        // Compute signals and audiences
        this.compute(pageView);

        const hasNewSignals = this.signals?.matched?.length !== existingSignals;
        // If we have matched new signals...
        if (hasNewSignals) l("ms");

        const hasNewAudiences =
          this.audiences?.active.length !== existingAudiences;
        // If we have matched new audiences...
        if (hasNewAudiences) l("ma");
      }
    }

    // Call event handler
    // handlers.onManifestReady(this, manifest);
    this.#handler("onManifestReady", this, manifest);
  };

  /** Safely return the current location.href */
  get page() {
    if (isSSR()) return "";
    return location.href;
  }

  /** Get the current pageView from the pageViews array */
  get #cpv() {
    const { pageViews } = this;
    const len = pageViews.length;
    return len ? pageViews[pageViews.length - 1] : null;
    // return pageViews[pageViews.length - 1];
  }

  /** Assign any state or [value, options] to persist the value */
  set #save(state: IPersonalizationStore | [unknown, IStoreOptions]) {
    if (isStore(state)) {
      this.#store.set(state);
    }
    if (isArray(state) && state.length === 2) {
      const [value, opts] = state;
      this.#store.set(value, opts);
    }
  }

  /** Return an existing entry from the store or initialise a new state */
  get state() {
    return (
      this.#store.get<IPersonalizationStore>() /** generate a personalisation uuid and a percentile for random bucketing */ || {
        /** New visitor uuid */
        cpid: crypto.randomUUID(),
        /** New percentile random bucketing to 2 dp */
        pc: Math.floor(Math.random() * 10000),
        pageViews: 0,
        signals: { active: [] },
        audiences: { active: [] },
      }
    );
  }

  constructor({
    client,
    debug,
    handlers,
    manifest,
    session,
  }: PersonalizationContextOptions = {}) {
    const { l } = this;

    this.debug = debug || false;

    for (const h in handlers) {
      const method = h as keyof IHandlers;
      if (typeof handlers[method] === "function") {
        // (this.handlers[method] as unknown) = handlers[method];
        this.addHandler(method, handlers[method]);
      }
    }

    this.currentPage = this.page;
    this.#store = new Store({ persist: !session });
    // Get the current state from the store
    const state = this.state;

    // Check for a cpid cookie we will use that if one is found
    const cookieId = this.#store.get<string>({ type: "c", key: "cpid" });
    if (cookieId) state.cpid = cookieId;

    const id = (this.cpid = state.cpid);
    const pc = (this.percentile = state.pc / 100); // percentile is a number with precision of 2 e.g. 42.75%

    // Update store with new state
    this.#save = state;

    // Set cpid cookie
    this.#save = [id, { type: "c", key: "cpid" }];

    // Dynamically import logging if we have set debug flag
    l("init", id, pc, state.pageViews);

    // Initialise a new session
    this.session = new Session(this);

    // Ensure we have a manifest
    if (manifest) {
      l("im", manifest);
      this.manifest = new Manifest(
        manifest,
        this.#onManifestReady,
        l,
        state.manifest
      );
    } else if (client) {
      l("ic");
      this.manifest = new Manifest(
        client,
        this.#onManifestReady,
        l,
        state.manifest
      );
    } else {
      console.warn(`cp: client or manifest required`);
    }
    this.#init();
  }

  pageView = (url = this.page) => {
    const { l, pageViews } = this;
    pageViews.push([url, new Date(), null]);

    const state = this.state;
    const referrer = !isSSR() ? document.referrer : undefined;

    let currentPage: string | undefined;
    let previousPage: string | undefined;

    // If no current page in state
    if (!state.currentPage) {
      l("pn", referrer);
      // Set currentPage
      currentPage = state.currentPage = url;

      // Set previousPage as document referrer
      previousPage = state.previousPage = referrer;
    }
    // If current page has changed
    else if (state.currentPage !== url) {
      l("pc", referrer);
      // Set current and previousPage
      previousPage = state.previousPage = referrer || state.currentPage;
      currentPage = state.currentPage = url;
    } else {
      // Current page has not changed
      l("ps", referrer);
      // Use state values
      currentPage = state.currentPage;
      previousPage = state.previousPage = referrer;
    }

    this.currentPage = currentPage;
    this.previousPage = previousPage;

    // Record page view
    state.pageViews++;
    l("pv", state.pageViews, pageViews);

    // Persist new state
    this.#save = state;

    // If the manifest is available, compute signals for this page
    if (this.manifest?.isReady) {
      // Compute signals and audiences
      this.compute();
    } else l("pm");

    // Call event handler
    // handlers.onPageView(this, currentPage, previousPage);
    this.#handler("onPageView", this, currentPage, previousPage);
  };

  /** Add new signal attributes identified within the app to the personalization context */
  setAttributes = (appSignals: AppSignals) => {
    if (objectKeys(appSignals).length) {
      const existing = this.app || {};
      const prev = stringify(existing);
      // Update app signals in this context
      this.app = { ...existing, ...appSignals };
      const next = stringify(this.app);
      // Crude deep comparison to save needlessly recomputing signals
      if (next !== prev) this.compute();
    }
  };

  /** Set signal attributes within the app to override the personalization context */
  overrideAttributes = (overrideSignals: AppOverrideSignals) => {
    if (objectKeys(overrideSignals).length) {
      const { state } = this;
      const existing = state.overrides;
      const prev = stringify(existing);
      // Update override signals in this context
      this.#save = { ...state, overrides: { ...existing, ...overrideSignals } };
      const next = stringify(this.state.overrides);
      // Crude deep comparison to save needlessly recomputing signals
      if (next !== prev) this.compute();
    }
  };

  /** Toggle an audience on or off for use when previewing sites */
  toggleAudience = (audienceId: string) => {
    const { state } = this;
    if (state.audiences?.matched) {
      if (state.audiences.active.includes(audienceId)) {
        // "Uncheck" audience by clearing all previous matches in the store
        // We can get away with just mutating state here
        delete state.audiences.matched[audienceId];
      } else {
        // Add audience id to the matched array
        // so it is set active in the next compute;
        state.audiences.matched[audienceId] = [{ p: "preview", t: 0 }];
      }
      // Persist the state to the store
      this.#save = state;
      // and then call the compute method
      this.compute();
    }
  };
}
