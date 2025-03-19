import { type RouteConfig, index } from "@react-router/dev/routes";

const routes: RouteConfig = [
  index("routes/home.tsx"),
  {
    path: "/page1",
    file: "./pages/page1.tsx",
  },
  {
    id: "artsHome",
    path: "/arts/home",
    file: "./pages/page1.tsx",
  },
  {
    id: "sportsHome",
    path: "/sports/home",
    file: "./pages/page1.tsx",
  },
];

export default routes;
