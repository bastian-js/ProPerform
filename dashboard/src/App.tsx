import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AppRoutes from "./routes";
import { apiFetch } from "./helpers/apiFetch";

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const accessToken = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!accessToken && !refreshToken) {
        if (pathname !== "/login") navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await apiFetch(
          "https://api.properform.app/auth/verify-token",
        );

        if (res.status === 401) {
          const refreshRes = await apiFetch(
            "https://api.properform.app/auth/refresh",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refresh_token: refreshToken }),
            },
          );

          if (refreshRes.ok) {
            const data = await refreshRes.json();

            localStorage.setItem("token", data.access_token);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            if (pathname !== "/login") navigate("/login", { replace: true });
          }
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
