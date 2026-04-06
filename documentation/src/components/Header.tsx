import { useState } from "react";
import { Search, LogOut } from "lucide-react";
import SearchModal from "./SearchModal";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("https://api.properform.app/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: localStorage.getItem("refresh_token"),
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      } else {
        alert("Logout failed. Please try again.");
        console.error(res.status);
        console.error(data.error);
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("An error occurred during logout. Please try again.");
    }
  };

  return (
    <>
      <header className="bg-blue-600 text-white px-6 py-3 shadow-md flex items-center transition-all duration-300 shrink-0">
        <h2 className="text-lg font-semibold">Dokumentation</h2>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            <Search size={18} />
            <span className="text-sm">Search</span>
          </button>

          <button
            onClick={() => handleLogout()}
            aria-label="Logout"
            title="Logout"
            className="flex items-center justify-center px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
