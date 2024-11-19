import { type RouteConfig, index } from "@react-router/dev/routes";

export const routes: RouteConfig = [
  index("routes/home.tsx"),
  {
    path: "/page1",
    file: "./pages/page1.tsx",
  },
];
