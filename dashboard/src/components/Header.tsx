export default function Header() {
  function handleLogout() {
    localStorage.removeItem("token");
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
