import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("https://api.properform.app/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    } else {
      alert(data.error || "Login fehlgeschlagen");
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setResetLoading(true);

    try {
      await fetch("https://api.properform.app/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
    } catch (_) {
      // Fehler ignorieren – wir zeigen immer die Erfolgsmeldung
    }

    setResetLoading(false);
    setResetDone(true);
  }

  function closeModal() {
    setModalOpen(false);
    setResetEmail("");
    setResetLoading(false);
    setResetDone(false);
  }

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-[#101828] text-white px-4">
        <div className="bg-white/10 backdrop-blur-lg p-14 rounded-3xl shadow-2xl w-full max-w-xl">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-400 tracking-wide">
            Anmeldung
          </h1>

          <form onSubmit={handleLogin} className="flex flex-col space-y-7">
            <div>
              <label className="block text-sm mb-2 text-gray-300 tracking-wide">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-400"
                placeholder="z. B. patrick.maier@example.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300 tracking-wide">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            {/* Passwort vergessen */}
            <div className="flex justify-end -mt-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-blue-400 hover:text-blue-300 text-sm transition underline underline-offset-2 cursor-pointer"
              >
                Passwort vergessen?
              </button>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition text-white py-3 text-lg rounded-xl font-semibold tracking-wide shadow-lg hover:shadow-blue-700/30 cursor-pointer"
            >
              Einloggen
            </button>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-gray-500 text-xs">
              Nur für autorisierte Benutzer &bull; Daten werden vertraulich
              behandelt
            </p>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-[#1a2535] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {!resetDone ? (
              <>
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <div className="bg-blue-500/10 p-4 rounded-full">
                    <svg
                      className="w-8 h-8 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  Passwort zurücksetzen
                </h2>
                <p className="text-gray-400 text-sm text-center mb-6">
                  Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum
                  Zurücksetzen deines Passworts.
                </p>

                <form
                  onSubmit={handlePasswordReset}
                  className="flex flex-col gap-4"
                >
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="deine@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                  />

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {resetLoading ? (
                      <>
                        <svg
                          className="animate-spin w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        Wird gesendet...
                      </>
                    ) : (
                      "Link anfordern"
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Erfolg */
              <div className="flex flex-col items-center text-center py-4">
                <div className="bg-green-500/10 p-4 rounded-full mb-5">
                  <svg
                    className="w-10 h-10 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  E-Mail unterwegs!
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Falls ein Konto mit dieser Adresse existiert, wurde eine
                  E-Mail mit einem Link zum Zurücksetzen des Passworts gesendet.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-6 bg-gray-700 hover:bg-gray-600 transition text-white px-6 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                >
                  Schließen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
