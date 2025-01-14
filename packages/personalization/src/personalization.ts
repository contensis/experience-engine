import { CalculateAudiences } from "./audiences";
import { IManifestClientArgs, Manifest } from "./providers/manifest";
import { IManifest, IPersonalizationStore } from "./models";
import { CalculateSignals } from "./signals";
import { IStoreOptions, Store } from "./providers/store";
import { isArray, isSSR, isStore, now } from "./util";
import { logger, messages } from "./logs";

export type PersonalizationContextOptions = {
  client?: IManifestClientArgs | undefined;
  debug?: PersonalizationContext["debug"];
  handlers?: Partial<PersonalizationContext["handlers"]>;
  manifest?: IManifest;
  session?: true;
};

type PageView = [string, Date, CalculateSignals | null];

export class PersonalizationContext {
  private store: Store;
  cpid: string;
  percentile: number;
  audiences?: CalculateAudiences;
  currentPage: string = "";
  previousPage?: string;
  signals?: CalculateSignals;
  t = 0;
  /** Output console.log messaging, true or v=verbose */
  debug: boolean | "v";
  /** User-supplied event handlers */
  handlers: {
    /** onInit event handler, called when the context is initialized */
    onInit: (context: PersonalizationContext) => void;
    /** onNavigate event handler, called when client-side navigation has been detected */
    onNavigate: (
      context: PersonalizationContext,
      current: string,
      previous?: string
    ) => void;
    /** onPageView event handler, called when a pageView has been registered and signals have been calculated */
    onPageView: (
      context: PersonalizationContext,
      current: string,
      previous?: string
    ) => void;
    /** onManifestReady event handler, called when a manifest has been loaded and signals have been calculated */
    onManifestReady: (
      context: PersonalizationContext,
      manifest: IManifest
    ) => void;
  } = {
    onInit: () => {},
    onNavigate: () => {},
    onPageView: () => {},
    onManifestReady: () => {},
  };
  logger?: typeof logger;

  /** Log debug messages */
  l = (message: keyof typeof messages, ...values: unknown[]) => {
    if (this.debug)
      if (this.logger) this.logger(message, ...values);
      else {
        // Verbose messaging will output raw console.logs synchronously
        // before the logging bundle has finished async loading so the timing
        // of events can be accurately observed
        if (this.debug == "v") console.log("cp", message, values);
        this.logs(true)
          .then(() => this.l(message, ...values))
          .catch(() => {
            console.log("cp", message, values);
          });
      }
  };

  manifest?: Manifest;
  pageViews: PageView[] = [];

  /** Monitor for DOM mutations and subsequent href changes */
  private observe = () => {
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
        this.handlers.onNavigate(this, page, lastHref);
      }
    });

    const bodyEl = document.querySelector("body");

    observer.observe(bodyEl!, {
      childList: true,
      subtree: true,
    });
  };

  /** Safely return the current location.href */
  get page() {
    if (isSSR()) return "";
    return window.location.href;
  }

  /** Assign any state or [value, options] to persist the value */
  set save(state: IPersonalizationStore | [unknown, IStoreOptions]) {
    if (isStore(state)) this.store.set(state);
    if (isArray(state) && state.length === 2) {
      const [value, opts] = state;
      this.store.set(value, opts);
    }
  }

  /** Check the store for an existing entry or initialise a new state */
  get state() {
    return (
      this.store.get<IPersonalizationStore>() /** generate a personalisation uuid and a percentile for random bucketing */ || {
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
    const { l, onManifestReady } = this;

    this.debug = debug || false;

    for (const h in handlers) {
      const method = h as keyof PersonalizationContext["handlers"];
      if (typeof handlers[method] === "function")
        (this.handlers[method] as unknown) = handlers[method];
    }

    this.currentPage = this.page;
    this.store = new Store({ persist: !session });
    // Get the current state from the store
    const state = this.state;

    // Check for a cpid cookie we will use that if one is found
    const cookieId = this.store.get<string>({ type: "c", key: "cpid" });
    if (cookieId) state.cpid = cookieId;

    this.cpid = state.cpid;
    this.percentile = state.pc / 100; // percentile is a number with precision of 2 e.g. 42.75%

    // Update store with new state
    this.save = state;

    // Set cpid cookie
    this.save = [state.cpid, { type: "c", key: "cpid" }];

    // Dynamically import logging if we have set debug flag
    l("init", this.cpid, this.percentile, state.pageViews);

    // Ensure we have a manifest
    if (manifest) {
      l("im", manifest);
      this.manifest = new Manifest(
        manifest,
        onManifestReady,
        l,
        state.manifest
      );
    } else if (client) {
      l("ic");
      this.manifest = new Manifest(client, onManifestReady, l, state.manifest);
    } else {
      console.warn(`cp: client or manifest required`);
    }
    this.init();
  }

  init = () => {
    if (isSSR()) return;

    this.observe();

    this.handlers.onInit(this);
  };

  logs = async (debug?: boolean) =>
    debug && !this.logger
      ? // Dynamically import logging if we have set debug flag
        import("./logs").then(({ logger }) => {
          this.logger = logger;
        })
      : void 0;

  onManifestReady = (manifest: IManifest) => {
    const { l } = this;
    const state = this.state;

    const stateVersion = state.manifest?.version.versionNo;
    const manifestVersion = manifest?.version.versionNo;

    if (
      (manifestVersion && manifestVersion !== stateVersion) ||
      manifestVersion === "draft" ||
      !manifestVersion
    ) {
      l("mv", manifestVersion, stateVersion);
      this.save = { ...state, manifest };

      // Retrospectively calculate signals for any pageViews[][2] that are null
      const toCheck = this.pageViews.filter((pv) => pv[2] === null);
      for (const pageView of toCheck) {
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
    this.handlers.onManifestReady(this, manifest!);
  };

  pageView = (url = this.page) => {
    const { handlers, l, pageViews } = this;
    pageViews.push([url, new Date(), null]);

    const state = this.state;
    const referrer = !isSSR() ? window.document.referrer : undefined;

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
    this.save = state;

    // If the manifest is available, compute signals for this page
    if (this.manifest?.isReady) {
      // Compute signals and audiences
      this.compute(pageViews[pageViews.length - 1]);
    } else l("pm");

    this.t = now();
    // Call event handler
    handlers.onPageView(this, currentPage, previousPage);
  };

  compute = (pageView: PageView) => {
    // Compute signals
    const signals = (this.signals = new CalculateSignals(this));

    // Persist current signals state
    this.save = {
      ...this.state,
      signals: signals.state,
    };

    // Add signal state to pageViews array so we know it does not require recalculation
    pageView[2] = signals;

    // Determine audiences, evaluate conditions
    const audiences = (this.audiences = new CalculateAudiences(this));

    // Persist current audiences state
    this.save = {
      ...this.state,
      audiences: audiences.state,
    };
  };
}
