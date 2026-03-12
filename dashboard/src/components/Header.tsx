import { apiFetch } from "../helpers/apiFetch";

export default function Header() {
  async function handleLogout() {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    const body = JSON.stringify({ refresh_token: refreshToken });

    const logoutRes = await apiFetch("https://api.properform.app/auth/logout", {
      method: "POST",
      body: body,
    });

    if (!logoutRes.ok) {
      alert("Error logging out. Please try again.");
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/login";
  }

  return (
    <header className="bg-blue-600 text-white px-6 py-3 shadow-md flex justify-between items-center">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <button
        className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-gray-100 transition cursor-pointer"
        onClick={handleLogout}
      >
        Logout
      </button>
    </header>
  );
}
