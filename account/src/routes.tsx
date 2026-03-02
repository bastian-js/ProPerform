import Home from "./pages/Home";
import ResetPassword from "./pages/ResetPassword";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
];

export default routes;
