# Frequently asked questions

- I want to **keep track of how many pages** the visitor has viewed/navigated

  - The [Experience Engine Context](https://github.com/contensis/experience-engine/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md) automatically tracks the number of pages the visitor has viewed in the current session, and a total page view count from the current and all previous sessions.
  - You need to do nothing to maintain these counters

- I want to **use data I have retrieved from an external API** to trigger a signal and activate an audience

  - Use Custom Attributes, set these up in Contensis to form part of the conditions to trigger the signal
  - The signal and audience "definitions" will be served to site visitors via the [Manifest](https://github.com/contensis/experience-engine/blob/main/docs/MANIFEST.md)
  - Make a call to [`setAttributes`](https://github.com/contensis/experience-engine/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md#setattributes) in your API response handler to supply the data for any custom attributes and trigger signal/audience calculations

- I want to activate a signal/audience **when the user performs a specific action on my site**. For example, if they perform a search, make a purchase or click a specific call to action.

  - Use Custom Attributes, set these up in Contensis to form part of the conditions to trigger the signal
  - The signal and audience "definitions" will be served to site visitors via the [Manifest](https://github.com/contensis/experience-engine/blob/main/docs/MANIFEST.md)
  - Make a call to [`setAttributes`](https://github.com/contensis/experience-engine/blob/main/packages/personalization/docs/PERSONALIZATION_CONTEXT.md#setattributes) in your action handler to supply the data for any custom attributes and trigger signal/audience calculations

- I want to personalize parts of my site **based on the visitor's location**
  - Configure a signal condition in Contensis to look for the built-in attribute `location.country`
  - Or, use your own GeoIP service and create custom attributes in Contensis

- Why do I see the content change to a personalized variant after the page has loaded?

  - If your page is server-side rendered, we do not currently support serving personalized content via SSR
  - Many of the signal attributes rely on browser-only APIs, signal/audience calculations can only be done client-side
  - To prevent the content change immediately after loading we can wrap personalized component(s) so they do not server-side render, and allow them to render client-side
  - A signal that activates an audience and personalizes content on a user's first ever page view will render a default variant until we have loaded the [Manifest](https://github.com/contensis/experience-engine/blob/main/docs/MANIFEST.md) for the first time

- Why are the `session.referrer` attributes blank?
  - This does not work in the same way a browser's "back" button would work
  - If a user visits your site directly by loading from a shortcut or by typing the address
  - If the user clicks a link to your site, popular browsers will not reveal referrer information to the next site by default
  - The referring site can opt to reveal parts or all of this referrer information to the next site by using a [referrer policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy) header or adding an appropriate `<meta name="referrer" .../>` tag in the page containing the link to your site. The `content` attribute dictates how much information is shared and the conditions in which it is shared.
