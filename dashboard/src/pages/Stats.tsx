import { useState, useEffect } from "react";
import authFetch from "../functions/authFetch";

export default function Stats() {
  const [numberAll, setNumberAll] = useState(0);
  const [numberOfUsers, setNumberOfUsers] = useState(0);
  const [numberOfTrainers, setNumberOfTrainers] = useState(0);
  const [numberOfOwners, setNumberOfOwners] = useState(0);

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      /*
      const [usersRes, trainersRes] = await Promise.all([
        fetch("https://api.properform.app/users/getNumberOfUsers", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://api.properform.app/users/getNumberOfTrainers", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      */

      const allRes = await authFetch("https://api.properform.app/users");

      const trainersRes = await authFetch(
        "https://api.properform.app/users/trainers",
      );

      const usersRes = await authFetch(
        "https://api.properform.app/users/users",
      );

      const ownersRes = await authFetch(
        "https://api.properform.app/users/owners",
      );

      if (allRes.ok) {
        const usersData = await allRes.json();
        setNumberAll(usersData.total ?? 3000);
      }

      if (trainersRes.ok) {
        const trainerData = await trainersRes.json();
        setNumberOfTrainers(trainerData.total ?? 2000);
      }

      if (usersRes.ok) {
        const userData = await usersRes.json();
        setNumberOfUsers(userData.total ?? 1000);
      }

      if (ownersRes.ok) {
        const ownerData = await ownersRes.json();
        setNumberOfOwners(ownerData.total ?? 500);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = [
    {
      label: "Alle Nutzer",
      value: numberAll,
    },
    {
      label: "Users",
      value: numberOfUsers,
    },
    { label: "Trainer", value: numberOfTrainers },
    { label: "Owners", value: numberOfOwners },
  ];

  const allOwners = stats.find((s) => s.label === "Owners");

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl shadow-2xl p-10 max-w-3xl w-[90%] text-center">
        <h1 className="text-4xl font-bold mb-8">Statistiken</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.slice(0, -1).map((s, i) => (
            <div
              key={i}
              className="bg-white/20 rounded-2xl p-6 shadow-md hover:bg-white/30 transition transform hover:-translate-y-1"
            >
              <p className="text-5xl font-bold">{s.value}</p>
              <p className="text-lg opacity-90 mt-2">{s.label}</p>
            </div>
          ))}

          {allOwners && (
            <div className="sm:col-span-3 bg-white/20 rounded-2xl p-6 shadow-md hover:bg-white/30 transition transform hover:-translate-y-1">
              <p className="text-5xl font-bold">{allOwners.value}</p>
              <p className="text-lg opacity-90 mt-2">{allOwners.label}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
