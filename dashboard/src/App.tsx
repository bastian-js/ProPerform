import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AppRoutes from "./routes";

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (pathname !== "/login") navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await fetch(
          "https://api.properform.app/auth/verify-token",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          if (pathname !== "/login") navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Error verifying token:", err);
      }
    };

    verifyToken();
  }, [pathname, navigate]);

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white overflow-x-hidden">
      {pathname !== "/login" && <Sidebar />}
      <div className="flex flex-col flex-1">
        {pathname !== "/login" && <Header />}
        <main className="flex-1 overflow-y-auto">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}
