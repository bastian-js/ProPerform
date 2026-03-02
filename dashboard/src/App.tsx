import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AppRoutes from "./routes";

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

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
