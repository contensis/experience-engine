import { IManifestStore, Manifest } from "./manifest";
import { Store } from "./store";
import { isSSR } from "./util";

console.log(`Hello from TypeScript`);

export type PersonalizationContextOptions = {
  manifest?: Manifest;
  session?: true;
};

export class PersonalizationContext {
  private store: Store;
  private cpid: string;
  private percentile: number;
  private currentPage?: string;
  private previousPage?: string;
  private pageViews: [string, Date][] = [];

  /** generate a personalisation uuid and a percentile for random bucketing */
  private initialState = (): IManifestStore => {
    return { cpid: this.newId(), pc: this.newPc(), pageViews: 0 };
  };

  /** personalisation uuid */
  private newId = () => crypto.randomUUID();

  /** random bucketing */
  private newPc = () => Math.floor(Math.random() * 10000);

  get page() {
    if (isSSR()) return undefined;
    return window.location.href;
  }

  get state() {
    // Check the store for an existing entry or initialise a new state
    return this.store.get<IManifestStore>() || this.initialState();
  }

  constructor({ manifest, session }: PersonalizationContextOptions = {}) {
    this.store = new Store({ persist: !session });
    const state = this.state;

    // Check for a cpid cookie and use that if one is found
    const cookieId = this.store.get({ type: "cookie", key: "cpid" });
    if (cookieId) state.cpid = cookieId;

    this.cpid = state.cpid;
    this.percentile = state.pc / 100; // percentile is a number with precision of 2 e.g. 42.75%

    console.log(`cpId: ${this.cpid}, percentile: ${this.percentile}%`);

    // Update store with new state
    this.store.set(state);
    // Set cpid cookie
    this.store.set(state.cpid, { type: "cookie", key: "cpid" });

    this.init();
  }

  init = () => {
    if (isSSR()) return;

    // window.onpopstate = (event) => {
    //   // The event object contains information about the popstate event
    //   // You can access the new URL using event.state or document.location.href
    //   const newURL = event.state || this.page;

    //   console.log("Router change detected:", newURL);
    //   console.log("event:", event);
    //   console.log("this.page:", this.page);

    //   // You can run your custom function here
    //   //runFunction();
    // };
    let previousUrl = "";
    const observer = new MutationObserver((mutations) => {
      if (location.href !== previousUrl) {
        if (previousUrl)
          console.log(
            "Route change detected:",
            `from ${this.currentPage}`,
            `to: ${this.page}`
          );
        else console.log(`Initial page view: ${this.page}`);
        previousUrl = location.href;
        this.pageView();
      }
    });
    observer.observe(document.querySelector("body")!, {
      childList: true,
      subtree: true,
    });
  };

  pageView = () => {
    this.pageViews.push([this.page!, new Date()]);

    const state = this.state;

    if (!state.currentPage)
      // Set currentPage
      this.currentPage = state.currentPage = this.page;
    else if (state.currentPage !== this.page) {
      // Set current and previousPage if current page has changed
      this.previousPage = state.previousPage = state.currentPage;
      this.currentPage = state.currentPage = this.page;
    } else {
      // Current page has not changed, use state values
      this.currentPage = state.currentPage;
      this.previousPage = state.previousPage;
    }

    // Record page view
    console.log(this.pageViews);
    state.pageViews++;

    // Update store with new state
    this.store.set(state);
  };
}
