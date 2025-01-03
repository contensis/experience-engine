import { CalculateAudiences } from "./audiences";
import { Manifest } from "./providers/manifest";
import { IManifest, IPersonalizationStore } from "./models";
import { CalculateSignals } from "./signals";
import { IStoreOptions, Store } from "./providers/store";
import { isArray, isSSR, isStore } from "./util";

export type PersonalizationContextOptions = {
  client?:
    | { alias: string; projectId?: string }
    | { rootUrl: string; projectId?: string }
    | undefined;
  debug?: boolean;
  manifest?: IManifest;
  session?: true;
};

export class PersonalizationContext {
  private store: Store;
  private cpid: string;
  private percentile: number;
  private _audiences?: CalculateAudiences;
  currentPage: string = "";
  previousPage?: string;
  /** Output console.log messaging */
  debug = true;
  /** User-supplied event handlers */
  handlers: {
    onInit: () => void;
    onNavigate: (current: string, previous?: string) => void;
    onPageView: (current: string, previous?: string) => void;
    onManifestReady: (manifest: IManifest) => void;
  } = {
    onInit: () => {},
    onNavigate: () => {},
    onPageView: () => {},
    onManifestReady: () => {},
  };
  /** Log debug messages */
  log = (...messages: unknown[]) =>
    this.debug
      ? console.log(`@contensis/personalization:`, ...messages)
      : void 0;

  manifest?: Manifest;
  pageViews: [string, Date, CalculateSignals | null][] = [];

  /** generate a personalisation uuid and a percentile for random bucketing */
  private initialState = (): IPersonalizationStore => {
    return {
      cpid: this.newId(),
      pc: this.newPc(),
      pageViews: 0,
      signals: { active: [] },
      audiences: { active: [] },
    };
  };

  /** New visitor uuid */
  private newId = () => crypto.randomUUID();

  /** New percentile random bucketing to 2 dp */
  private newPc = () => Math.floor(Math.random() * 10000);

  /** Monitor for DOM mutations and subsequent href changes */
  private observeNavigation = () => {
    let lastHref = "";
    const observer = new MutationObserver(() => {
      // If page has changed (or is initial page load)
      if (this.page !== lastHref) {
        this.log(
          lastHref
            ? `Route change detected: from ${this.currentPage} to: ${this.page}`
            : `Initial page view: ${this.page}`
        );
        lastHref = this.page!;
        // Record the page view
        this.pageView();

        // Call navigate handler
        this.handlers.onNavigate(this.page!, lastHref);
      }
    });

    const bodyEl = document.querySelector("body");

    observer.observe(bodyEl!, {
      childList: true,
      subtree: true,
    });
  };

  /** Get the computed audiences for the current route  */
  get audiences() {
    return this._audiences;
  }

  /** Safely return the current location.href */
  get page() {
    if (isSSR()) return "";
    return window.location.href;
  }

  /** Assign any state or [value, options] to persist the value */
  set persist(state: IPersonalizationStore | [unknown, IStoreOptions]) {
    if (isStore(state)) this.store.set(state);
    if (isArray(state) && state.length === 2) {
      const [value, opts] = state;
      this.store.set(value, opts);
    }
  }

  /** Gets the computed signals for the current route */
  get signals() {
    return this.pageViews[this.pageViews.length - 1]?.[2];
  }

  /** Check the store for an existing entry or initialise a new state */
  get state() {
    return this.store.get<IPersonalizationStore>() || this.initialState();
  }

  constructor({
    client,
    debug,
    manifest,
    session,
  }: PersonalizationContextOptions = {}) {
    const { log, onManifestReady } = this;

    this.debug = debug || false;

    this.currentPage = this.page;
    this.store = new Store({ persist: !session });
    // Get the current state from the store
    const state = this.state;

    // Check for a cpid cookie we will use that if one is found
    const cookieId = this.store.get<string>({ type: "cookie", key: "cpid" });
    if (cookieId) state.cpid = cookieId;

    this.cpid = state.cpid;
    this.percentile = state.pc / 100; // percentile is a number with precision of 2 e.g. 42.75%

    log(
      `visitorId: ${this.cpid}, percentile: ${this.percentile}%, pageViews: ${state.pageViews}`
    );

    // Update store with new state
    this.persist = state;
    // Set cpid cookie
    this.persist = [state.cpid, { type: "cookie", key: "cpid" }];

    // Ensure we have a manifest
    if (manifest) {
      log(`Initialising manifest with supplied manifest`, manifest);
      this.manifest = new Manifest(
        manifest,
        onManifestReady,
        log,
        state.manifest
      );
    } else if (client) {
      log(`Initialising manifest with client`);
      this.manifest = new Manifest(
        client,
        onManifestReady,
        log,
        state.manifest
      );
    }

    this.init();
  }

  init = () => {
    if (isSSR()) return;

    this.observeNavigation();

    this.handlers.onInit();
  };

  onManifestReady = (manifest: IManifest) => {
    const { log } = this;
    const state = this.state;

    const stateVersion = state.manifest?.version.versionNo;
    const manifestVersion = manifest?.version.versionNo;

    if (manifestVersion && manifestVersion !== stateVersion) {
      log(
        `[onManifestReady] Manifest updated ${
          stateVersion ? `from version ${stateVersion} ` : ""
        }to version ${manifestVersion}`
      );
      this.persist = { ...state, manifest };

      // Retrospectively calculate signals for any pageViews[][2] that are null
      const toCheck = this.pageViews.filter((pv) => pv[2] === null);
      for (const check of toCheck) {
        // Compute signals
        const signals = new CalculateSignals(this);
        const signalState = signals.state;
        const hasNewSignals =
          signalState.matched?.length !== this.state.signals?.matched?.length;

        // If we have matched new signals...
        if (hasNewSignals) {
          log(`[onManifestReady] Matched new signals from updated manifest`);
        }
        // Persist new signals state (including signals calculated for the first time after manifest is available)
        this.persist = {
          ...this.state,
          signals: signalState,
        };

        // Add signal state to pageViews array so we know it has been calculated
        check[2] = signals;

        // Determine audiences, evaluate conditions
        this._audiences = new CalculateAudiences(this);
        const audiences = this._audiences.state;

        const hasNewAudiences =
          audiences.active.length !== this.state.audiences?.active.length;
        // If we have matched new audiences...
        if (hasNewAudiences) {
          log(`[onManifestReady] Matched new audiences from updated manifest`);
        }
        // Persist new audiences state
        this.persist = {
          ...this.state,
          audiences,
        };
      }
    }

    // Call event handler
    this.handlers.onManifestReady(manifest!);
  };

  pageView = (url = this.page) => {
    const { log } = this;
    this.pageViews.push([url, new Date(), null]);

    const state = this.state;

    // If no current page in state
    if (!state.currentPage) {
      log(
        `[pageView] no current page in state; referrer: ${
          !isSSR() ? window.document.referrer : undefined
        }`
      );
      // Set currentPage
      this.currentPage = state.currentPage = url;

      // Set previousPage as document referrer
      this.previousPage = state.previousPage = !isSSR()
        ? window.document.referrer
        : undefined;
    }
    // If current page has changed
    else if (state.currentPage !== url) {
      log(
        `[pageView] current page in state has changed; referrer: ${
          !isSSR() ? window.document.referrer : undefined
        }`
      );
      // Set current and previousPage
      this.previousPage = state.previousPage =
        (!isSSR() ? window.document.referrer : undefined) || state.currentPage;
      this.currentPage = state.currentPage = url;
    } else {
      log(
        `[pageView] current page in state has not changed; referrer: ${
          !isSSR() ? window.document.referrer : undefined
        }`
      );
      // Current page has not changed
      // Use state values
      this.currentPage = state.currentPage;
      this.previousPage = state.previousPage = !isSSR()
        ? window.document.referrer
        : undefined;
    }

    // Record page view
    state.pageViews++;
    log(`[pageView] pageViews: ${state.pageViews}`, this.pageViews);

    // Persist new state
    this.persist = state;

    // If the manifest is available, compute signals for this page
    if (this.manifest?.isReady) {
      // Compute signals
      const signals = new CalculateSignals(this);

      // Persist current signals state
      this.persist = {
        ...this.state,
        signals: signals.state,
      };

      // Add signal state to pageViews array so we know it does not require recalculation
      this.pageViews[this.pageViews.length - 1][2] = signals;

      // Determine audiences, evaluate conditions
      const audiences = (this._audiences = new CalculateAudiences(this));

      // Persist current audiences state
      this.persist = {
        ...this.state,
        audiences: audiences.state,
      };
    } else {
      log(`[pageView] manifest is not ready yet`);
    }

    // Call event handler
    this.handlers.onPageView(this.currentPage, this.previousPage);
  };
}
