import { isSSR } from "../src/util";
import { PersonalizationContext } from "@contensis/personalization";

describe("Test personalization module", () => {
  test("Check we are running in SSR", () => {
    expect(isSSR()).toBe(true);
  });

  test("Create a new context", () => {
    const context = new PersonalizationContext();

    const privateContext = context as any; // accessing private class members
    expect(typeof privateContext.store).toBe("object");
    // Check we have initialised state
    expect(typeof context.state).toBe("object");
    
    expect(context).toHaveProperty("cpid");
    expect(typeof privateContext.cpid).toBe("string");
    expect(context.state.cpid).toHaveLength(36);


    expect(context).toHaveProperty("percentile");
    expect(typeof privateContext.percentile).toBe("number");
    expect(context.state.pc).toBeGreaterThan(0);
    expect(context.state.pc).toBeLessThanOrEqual(10000);

    //expect(typeof context.page).toBe("string");
  });
});
