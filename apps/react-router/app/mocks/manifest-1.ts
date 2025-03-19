import { IManifest } from "@contensis/personalization";

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
    },
    {
      id: "artsEngagedStudents",
      name: "Highly Engaged Arts Students",
      description: "Students with a deep interest in arts",
      conditions: {
        and: [
          {
            type: "audience",
            id: "artsInterestedStudents",
          },
          {
            or: [
              {
                type: "signal",
                id: "frequentArtsVisitor",
              },
              {
                type: "signal",
                id: "searchedForArts",
              },
            ],
          },
        ],
      },
    },
    {
      id: "loggedInUser",
      name: "Logged In User",
      description: "A user who is or has logged into the site",
      conditions: {
        and: [
          {
            type: "signal",
            id: "isLoggedIn",
          },
        ],
      },
    },
    {
      id: "sportsEnthusiasts",
      name: "Active Sports Enthusiasts",
      description: "Users actively engaged with sports-related content",
      conditions: {
        and: [
          {
            type: "signal",
            id: "frequentSportsVisitor",
          },
          {
            or: [
              {
                type: "signal",
                id: "purchasedSportsGear",
              },
              {
                type: "signal",
                id: "searchedForSportsEvents",
              },
            ],
          },
        ],
      },
    },
    {
      id: "techSavvyUsers",
      name: "Tech Savvy Users",
      description:
        "Users frequently engaging with technology and gadget content",
      conditions: {
        or: [
          {
            type: "signal",
            id: "frequentTechBlogReader",
          },
          {
            and: [
              {
                type: "signal",
                id: "frequentGadgetReviewer",
              },
              {
                type: "signal",
                id: "recentlyPurchasedTech",
              },
            ],
          },
        ],
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
            attribute: "page.path",
            startsWith: "/arts/",
          },
          {
            attribute: "page.path",
            startsWith: "/courses/arts/",
          },
        ],
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
    },
    {
      id: "purchasedSportsGear",
      name: "Purchased Sports Gear",
      minMatches: 1,
      where: {
        and: [
          {
            attribute: "purchaseCategory",
            equalTo: "sports",
          },
          {
            attribute: "purchaseAmount",
            greaterThan: 50,
          },
        ],
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
    },
  ],
  version: {
    published: new Date("2024-11-19T12:00:00Z"),
    publishedBy: "manifest-1.ts",
    versionNo: "0.0",
  },
};
