import { CalculateAudiences } from "./audiences";
import { Manifest } from "./providers/manifest";
import { IManifest, IPersonalizationStore, ISignalsStore } from "./models";
import { CalculateSignals } from "./signals";
import { IStoreOptions, Store } from "./providers/store";
import { isArray, isSSR, isStore } from "./util";

export type PersonalizationContextOptions = {
  client?: { alias: string; projectId: string };
  manifest?: IManifest;
  session?: true;
};

export class PersonalizationContext {
  private store: Store;
  private cpid: string;
  private percentile: number;
  private currentPage?: string;
  private previousPage?: string;
  private pageViews: [string, Date, ISignalsStore | null][] = [];
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
    this.debug ? console.log(...messages) : void 0;

  manifest?: Manifest;

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
    observer.observe(document.querySelector("body")!, {
      childList: true,
      subtree: true,
    });
  };

  /** Safely return the current location.href */
  get page() {
    if (isSSR()) return undefined;
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

  /** Check the store for an existing entry or initialise a new state */
  get state() {
    return this.store.get<IPersonalizationStore>() || this.initialState();
  }

  constructor({
    client,
    manifest,
    session,
  }: PersonalizationContextOptions = {}) {
    this.store = new Store({ persist: !session });
    // Get the current state from the store
    const state = this.state;

    // Check for a cpid cookie we will use that if one is found
    const cookieId = this.store.get<string>({ type: "cookie", key: "cpid" });
    if (cookieId) state.cpid = cookieId;

    this.cpid = state.cpid;
    this.percentile = state.pc / 100; // percentile is a number with precision of 2 e.g. 42.75%

    this.log(
      `visitorId: ${this.cpid}, percentile: ${this.percentile}%, pageViews: ${state.pageViews}`
    );

    // Update store with new state
    this.persist = state;
    // Set cpid cookie
    this.persist = [state.cpid, { type: "cookie", key: "cpid" }];

    // Ensure we have a manifest
    if (client) {
      this.log(`Initialising manifest with client`);
      this.manifest = new Manifest(
        { alias: "", projectId: "" },
        this.onManifestReady,
        state.manifest
      );
    }
    if (manifest) {
      this.log(`Initialising manifest with supplied manifest`, manifest);
      this.manifest = new Manifest(
        manifest,
        this.onManifestReady,
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
    const state = this.state;

    const stateVersion = state.manifest?.version.versionNo;
    const manifestVersion = manifest?.version.versionNo;

    if (manifestVersion && manifestVersion !== stateVersion) {
      this.log(
        `Manifest updated ${
          stateVersion ? `from version ${stateVersion} ` : ""
        }to version ${manifestVersion}`
      );
      this.persist = { ...this.state, manifest };

      // Retrospectively calculate signals for any pageViews[][2] that are null
      const toCheck = this.pageViews.filter((pv) => pv[2] === null);
      for (const check of toCheck) {
        // Compute signals
        const signals = new CalculateSignals(this).state;
        const hasNewSignals =
          signals.matched?.length !== this.state.signals?.matched?.length;

        // If we have matched new signals...
        if (hasNewSignals) {
          // Persist new signals state
          this.persist = {
            ...this.state,
            signals,
          };
        }

        // Add signal state to pageViews array so we know it has been calculated
        check[2] = this.state.signals!;

        // Determine audiences, evaluate conditions
        const audiences = new CalculateAudiences(this).state;

        const hasNewAudiences =
          audiences.active.length !== this.state.audiences?.active.length;
        // If we have matched new audiences...
        if (hasNewAudiences)
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

  pageView = () => {
    this.pageViews.push([this.page!, new Date(), null]);

    const state = this.state;

    // If no current page in state
    if (!state.currentPage)
      // Set currentPage
      this.currentPage = state.currentPage = this.page;
    // If current page has changed
    else if (state.currentPage !== this.page) {
      // Set current and previousPage
      this.previousPage = state.previousPage = state.currentPage;
      this.currentPage = state.currentPage = this.page;
    } else {
      // Current page has not changed
      // Use state values
      this.currentPage = state.currentPage;
      this.previousPage = state.previousPage;
    }

    // Record page view
    state.pageViews++;
    this.log(`pageViews: ${state.pageViews}`, this.pageViews);

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
      this.pageViews[this.pageViews.length - 1][2] = this.state.signals!;

      // Determine audiences, evaluate conditions
      const audiences = new CalculateAudiences(this);

      // Persist current audiences state
      this.persist = {
        ...this.state,
        audiences: audiences.state,
      };
    }

    // Call event handler
    this.handlers.onPageView(this.currentPage!, this.previousPage);
  };
}
