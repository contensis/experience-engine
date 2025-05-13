import { IPersonalizationSessionStore } from "./models";
import { PersonalizationContext } from "./personalization";
import { Store } from "./providers/store";
import { BrowserSignalsSnapshot } from "./signals/browser";
import { UrlSignals } from "./signals/url";
import { date, isoDate, isSSR, now, toSeconds } from "./util";

/**
 * Interact with session store and hold session signals
 */
export class Session {
  #context: PersonalizationContext;
  #store: Store;
  /** Preserved page view count from the session state */
  #prev: number;

  constructor(context: PersonalizationContext) {
    this.#context = context;
    this.#store = new Store({ type: "sessionStorage" });
    // Get the current state from the store
    const state = this.state;
    // Preserve page view count from previous state
    this.#prev = state.pageViews;

    // Update store with new state
    this.#save = state;
  }

  /** The total number of page views in the context */
  get pvc() {
    return this.#context.pageViews.length;
  }

  /** Check the store for an existing entry or initialise a new state */
  get state() {
    const existing = this.#store?.get<IPersonalizationSessionStore>();
    return existing || this.#initialState();
  }

  /** Assign any state to persist the value to storage */
  set #save(state: IPersonalizationSessionStore) {
    state.pageViews = this.#prev + this.pvc;
    state.lastActivity = isoDate();
    state.duration = toSeconds(now() - +date(state.startTime));
    this.#store.set(state);
  }

  /** Clear the session store */
  clear = () => this.#store.clear();

  /** Provide a partial state and update the session store */
  update = (patch: Partial<IPersonalizationSessionStore> = {}) => {
    this.#save = { ...this.state, ...patch };
  };

  #initialState = () => {
    const date = isoDate();
    const browser = BrowserSignalsSnapshot();
    const { page, state } = this.#context;
    const url = UrlSignals(page);
    const initial: IPersonalizationSessionStore = {
      isFirstVisit: state.pageViews < 2,
      duration: 0,
      entryPage: url.path(),
      lastActivity: date,
      pageViews: this.pvc,
      startTime: date,
      browser,
      location: state.manifest?.location,
    };

    const referrer = !isSSR() ? document.referrer : "";
    if (referrer) {
      const url = UrlSignals(referrer);
      initial.referrer = {
        baseUrl: url.baseUrl(),
        domain: url.domain(),
        path: url.path(),
        querystring: url.querystring(),
        queryParams: url.queryParams(),
        // "queryParams.*": (name: string) => url.queryParam(name),
        subdomain: url.subdomain(),
        url: url.href(),
      };
    }

    return initial;
  };
}
