import { useState } from "react";

export default function CreateTrainer() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone_number, setPhoneNumber] = useState("");

  async function handleCreateTrainer(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Kein Token vorhanden – bitte zuerst anmelden.");
      return;
    }

    const res = await fetch("https://api.properform.app/trainers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        //   const { firstname, lastname, password, birthdate, email, phone_number }
        firstname,
        lastname,
        password,
        birthdate,
        email,
        phone_number,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`✅ Trainer ${firstname} erfolgreich erstellt!`);
      setFirstname("");
      setLastname("");
      setBirthdate("");
      setEmail("");
      setPassword("");
      setPhoneNumber("");
    } else {
      alert(data.error || "Fehler beim Erstellen des Trainers");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0E1628] text-white px-6 py-16">
      <div className="bg-[#1C2541]/70 backdrop-blur-md border border-white/10 p-12 rounded-3xl shadow-2xl w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-12 text-center text-blue-400 tracking-wide flex items-center justify-center gap-3">
          Trainer erstellen
        </h1>

        <form
          onSubmit={handleCreateTrainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 text-gray-200"
        >
          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-400 tracking-wide">
              Vorname
            </label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-xl bg-[#2A3558] text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-400 transition"
              placeholder="Max"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-400 tracking-wide">
              Nachname
            </label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-xl bg-[#2A3558] text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-400 transition"
              placeholder="Mustermann"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-400 tracking-wide">
              Geburtsdatum
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
              max="2025-12-31"
              min="1900-01-01"
              className="w-full px-5 py-3 rounded-xl bg-[#2A3558] text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-400 tracking-wide">
              Telefonnummer
            </label>
            <input
              type="tel"
              value={phone_number}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-xl bg-[#2A3558] text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-400 transition"
              placeholder="+43 123 456789"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-400 tracking-wide">
              E-Mail-Adresse
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-xl bg-[#2A3558] text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-400 transition"
              placeholder="trainer@example.com"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-400 tracking-wide">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-xl bg-[#2A3558] text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-400 transition"
              placeholder="••••••••"
            />
          </div>

          <div className="md:col-span-2 flex justify-center mt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition text-white py-4 px-12 text-lg rounded-xl font-semibold tracking-wide shadow-lg hover:shadow-blue-700/40 w-full cursor-pointer"
            >
              Trainer erstellen
            </button>
          </div>

          <p className="md:col-span-2 text-center text-gray-500 text-sm">
            Nur Admins dürfen neue Trainer erstellen.
          </p>
        </form>
      </div>
    </div>
  );
}
