import { IExperienceEngineSessionStore, ISessionAttribution } from "./models";
import { ExperienceEngineContext } from "./experience-engine";
import { Store } from "./providers/store";
import { BrowserSignalsSnapshot } from "./signals/browser";
import { RouteSignalsSnapshot } from "./signals/route";
import { UrlSignals } from "./signals/url";
import {
  date,
  isArray,
  isoDate,
  isSSR,
  isUndefined,
  now,
  toSeconds,
} from "./util";

/**
 * Interact with session store and hold session signals
 */
export class Session {
  #context: ExperienceEngineContext;
  #store: Store;
  /** Preserved page view count from the session state */
  #prev: number;

  constructor(context: ExperienceEngineContext) {
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
    const existing = this.#store?.get<IExperienceEngineSessionStore>();
    return existing || this.#initialState();
  }

  /** Assign any state to persist the value to storage */
  set #save(state: IExperienceEngineSessionStore) {
    state.pageViews = this.#prev + this.pvc;
    state.lastActivity = isoDate();
    state.duration = toSeconds(now() - +date(state.startTime));
    this.#store.set(state);
  }

  /** Clear the session store */
  clear = () => this.#store.clear();

  /** Provide a partial state and update the session store */
  update = (patch: Partial<IExperienceEngineSessionStore> = {}) => {
    this.#save = { ...this.state, ...patch };
  };

  #initialState = () => {
    const date = isoDate();
    const browser = BrowserSignalsSnapshot();
    const { page, state } = this.#context;
    const url = UrlSignals(page);
    const route = RouteSignalsSnapshot(url.href());

    const attribution = Object.fromEntries(
      [
        "utm_campaign",
        "utm_source",
        "utm_medium",
        "utm_content",
        "utm_term",
        "gclid",
        "dclid",
        "msclkid",
        "fbclid",
        "ttclid",
        "li_fat_id",
        "twclid",
      ]
        .map((source) => {
          const value = route["page.queryParams"](source);
          return [source, isArray(value) ? value.pop() : value];
        })
        .filter(([, value]) => !isUndefined(value)) as [
        keyof ISessionAttribution,
        string,
      ][],
    );

    const testUrl = "http://localhost:5173/?utm_campaign=test&utm_source=google&utm_medium=cpc&utm_content=ad1&utm_term=personalization&gclid=12345&dclid=67890&msclkid=abcde&fbclid=vwxyz&ttclid=11111&li_fat_id=22222&twclid=33333";
    const initial: IExperienceEngineSessionStore = {
      isFirstVisit: state.pageViews < 2,
      duration: 0,
      entryPage: url.path(),
      lastActivity: date,
      pageViews: this.pvc,
      startTime: date,
      attribution,
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
