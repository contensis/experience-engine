import { Suspense, useEffect, useState } from "react";
import { Link } from "react-router";
import { usePersonalizationContext } from "@contensis/personalization-react";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import Audiences from "~/audiences";

export function Welcome() {
  const { context, getAttributes, overrideAttributes, setAttributes } =
    usePersonalizationContext();

  /** Manage a basket qty and a search term to test custom attributes */
  const [basketQty, setBasketQty] = useState(0);
  useEffect(() => {
    setAttributes({ basketQty, basketValue: 50 * basketQty });
  }, [basketQty]);
  const [searchInput, setSearchInput] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const totalSpendAttribute =
    (getAttributes("custom.totalSpend") as number) || 0;
  const [totalSpend, setTotalSpend] = useState(
    totalSpendAttribute // getAttributes(["custom.totalSpend"]) as number
  );
  useEffect(() => {
    setTotalSpend(totalSpendAttribute);
  }, [totalSpendAttribute]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to <span className="sr-only">React Router</span>
          </h1>
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={logoLight}
              alt="React Router"
              className="block w-full dark:hidden"
            />
            <img
              src={logoDark}
              alt="React Router"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <Link to={"/page1?field1=value1a&field1=value1b&field2=value2"}>
            Navigate to Page 1
          </Link>
          <Link to={"/arts/home?field1=value1a&field1=value1b&field2=value2"}>
            Navigate to Arts Home Page
          </Link>
          <Link to={"/sports/home"}>Navigate to Sports Home Page</Link>
          <Link to={"https://www.duckduckgo.com/"}>
            Navigate to External URL
          </Link>

          <div className="flex justify-center gap-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                onClick={() => {
                  context.reset();
                }}
              >
                Reset storage
              </button>
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                onClick={() => {
                  context.reset({ session: true });
                }}
              >
                Reset session
              </button>
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                onClick={() => {
                  location.reload();
                }}
              >
                Reload page
              </button>
            </div>
          </div>
          <div>
            Basket qty:{" "}
            <button
              id="decreaseQty"
              onClick={() => {
                setBasketQty(basketQty - 1);
              }}
            >
              -
            </button>{" "}
            {basketQty}{" "}
            <button
              id="increaseQty"
              onClick={() => {
                setBasketQty(basketQty + 1);
              }}
            >
              +
            </button>
          </div>
          <div>
            Basket value: {50.0 * basketQty}{" "}
            {basketQty > 0 ? (
              <button
                id="buy"
                onClick={() => {
                  const purchaseAmount = 50 * basketQty;
                  setAttributes({
                    purchaseAmount,
                    purchaseCategory: "sports",
                  });
                  // Track totalSpend by overriding this custom attribute
                  overrideAttributes({
                    "custom.totalSpend": totalSpend + purchaseAmount,
                  });
                }}
                title={`purchaseCategory: "sports"`}
              >
                Buy
              </button>
            ) : null}
          </div>
          <div>Total spend: £ {totalSpend}</div>
          <div>
            <input
              className="p-2 rounded-3xl"
              id="searchInput"
              type="text"
              placeholder={"Search"}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setAttributes({
                    searchCategory,
                    searchQuery: e.currentTarget.value,
                  });
                }
              }}
            ></input>{" "}
            <button
              className="p-2 rounded-full"
              id="searchSubmit"
              onClick={() => {
                setAttributes({
                  searchCategory,
                  searchQuery: searchInput,
                });
              }}
            >
              Go
            </button>
          </div>
          <div>
            <select
              id="searchCategory"
              onChange={(e) => {
                setSearchCategory(e.currentTarget.value);
              }}
            >
              <option>Search within a category</option>
              <option value={"sport"}>Sports</option>
              <option value={"event"}>Events</option>
            </select>
          </div>
        </nav>
        <Suspense fallback={<h2>🌀 Loading...</h2>}>
          <Audiences />
        </Suspense>
      </div>
    </div>
  );
}
