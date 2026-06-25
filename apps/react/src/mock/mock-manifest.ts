import { IManifest } from "@contensis/experience-engine";

export const MOCK_MANIFEST: IManifest = {
  audiences: [
    {
      id: "artsInterestedStudents",
      name: "Interested Arts Students",
      description: "Students who have browsed arts section",
      conditions: {
        and: [
          {
            type: "signal",
            id: "artsVisitor",
          },
        ],
      },
      version: {
        created: new Date("2024-11-22T00:00:00Z"),
        createdBy: "n.flatley",
        modified: new Date("2024-11-22T00:00:00Z"),
        modifiedBy: "n.flatley",
      },
    },
    {
      id: "userHasLoggedIn",
      name: "User has Logged In",
      description: "A user who is or has logged into the site",
      conditions: {
        and: [
          {
            type: "signal",
            id: "isLoggedIn",
          },
        ],
      },
      version: {
        created: new Date("2025-01-10T00:00:00Z"),
        createdBy: "n.flatley",
        modified: new Date("2025-01-10T00:00:00Z"),
        modifiedBy: "n.flatley",
      },
    },
    {
      id: "disallowWebsiteSignup",
      name: "Disallow website sign-up",
      description:
        "Not allowed to signup via the website and are instead signposted to contact us",
      conditions: {
        and: [
          {
            type: "signal",
            id: "blacklistCountryCode",
          },
        ],
      },
      version: {
        created: new Date("2025-01-10T00:00:00Z"),
        createdBy: "n.flatley",
        modified: new Date("2025-01-10T00:00:00Z"),
        modifiedBy: "n.flatley",
      },
    },
    {
      id: "allowWebsiteSignup",
      name: "Allow website sign-up",
      description:
        "Allow signup via the website only if we have not matched a blacklist country code",
      conditions: {
        and: [
          { type: "signal", id: "countryCodeIsKnown" },
          {
            not: {
              type: "audience",
              id: "disallowWebsiteSignup",
            },
          },
        ],
      },
      version: {
        created: new Date("2025-01-10T00:00:00Z"),
        createdBy: "n.flatley",
        modified: new Date("2025-01-10T00:00:00Z"),
        modifiedBy: "n.flatley",
      },
    },
  ],
  signals: [
    {
      id: "artsVisitor",
      name: "Arts Section Visitor",
      minMatches: 3,
      where: {
        or: [
          {
            attribute: "cookie.art",
            exists: true,
          },
          {
            attribute: "page.path",
            startsWith: "/arts/",
          },
          {
            attribute: "page.path",
            startsWith: "/courses/arts/",
          },
        ],
      },
      version: {
        created: "2024-06-01T00:00:00Z",
        createdBy: "s.horan",
        modified: "2024-06-04T00:00:00Z",
        modifiedBy: "j.doe",
      },
    },
    {
      id: "frequentArtsVisitor",
      name: "Frequent Arts Section Visitor",
      minMatches: 5,
      where: {
        or: [
          {
            attribute: "page.path",
            startsWith: "/arts/",
          },
          {
            attribute: "page.path",
            startsWith: "/courses/arts/",
          },
        ],
      },
      version: {
        created: "2024-06-01T00:00:00Z",
        createdBy: "s.horan",
        modified: "2024-06-04T00:00:00Z",
        modifiedBy: "j.doe",
      },
    },
    {
      id: "isLoggedIn",
      name: "Is Logged in?",
      minMatches: 1,
      where: {
        or: [
          {
            attribute: "cookie.RefreshToken",
            exists: true,
          },
          {
            attribute: "cookie.ContensisSecurityBearerToken",
            exists: true,
          },
        ],
      },
      version: {
        created: "2025-01-10T00:00:00Z",
        createdBy: "n.flatley",
        modified: "2025-01-10T00:00:00Z",
        modifiedBy: "n.flatley",
      },
    },
    {
      id: "blacklistCountryCode",
      name: "Blacklist Country Code",
      minMatches: 1,
      where: {
        and: [
          {
            attribute: "location.country",
            in: ["GB", "NG"],
          },
          {
            not: {
              attribute: "location.country",
              equalTo: "GB",
            },
          },
        ],
      },
      version: {
        created: "2025-01-10T00:00:00Z",
        createdBy: "n.flatley",
        modified: "2025-01-10T00:00:00Z",
        modifiedBy: "n.flatley",
      },
    },
    {
      id: "countryCodeIsKnown",
      name: "Country Code is known",
      minMatches: 1,
      where: {
        and: [
          {
            attribute: "location.country",
            exists: true,
          },
          {
            attribute: "location.country",
            matchesRegex: "^[A-Z]{2,}$",
          },
        ],
      },
      version: {
        created: "2025-01-10T00:00:00Z",
        createdBy: "n.flatley",
        modified: "2025-01-10T00:00:00Z",
        modifiedBy: "n.flatley",
      },
    },
    {
      id: "purchasedSportsGear",
      name: "Purchased Sports Gear",
      minMatches: 1,
      where: {
        and: [
          {
            attribute: "custom.purchaseCategory",
            equalTo: "sports",
          },
          {
            attribute: "custom.purchaseAmount",
            greaterThan: 50,
          },
        ],
      },
      version: {
        created: "2024-05-15T12:00:00Z",
        createdBy: "j.doe",
        modified: "2024-06-01T08:30:00Z",
        modifiedBy: "a.smith",
      },
    },
    {
      id: "frequentTechBlogReader",
      name: "Frequent Technology Blog Reader",
      minMatches: 10,
      where: {
        or: [
          {
            attribute: "page.path",
            contains: "techblog",
          },
          {
            attribute: "searchQuery",
            contains: "latest gadgets",
          },
        ],
      },
      version: {
        created: "2024-04-20T14:00:00Z",
        createdBy: "k.jones",
        modified: "2024-05-25T17:00:00Z",
        modifiedBy: "k.jones",
      },
    },
  ],
  version: {
    published: new Date("2024-11-19T12:00:00Z"),
    publishedBy: "manifest-1.ts",
    versionNo: "0.0",
  },
};
