import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { apiFetch } from "../../helpers/apiFetch";

const BASE_URL = "https://api.properform.app";

interface Notification {
  nid: number;
  title: string;
  body: string;
  target_type: string;
  target_id: number | null;
  created_by: string;
  created_at: string;
}

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const limit: number = 10;

  const fetchNotifications = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await apiFetch(`${BASE_URL}/admin/notifications`);

      if (!res.ok) {
        setError("Fehler beim Abrufen der Benachrichtigungen");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const allNotifications = Array.isArray(data)
        ? data
        : data.notifications || [];

      let filtered = allNotifications;
      if (filterType !== "all") {
        filtered = allNotifications.filter(
          (n: Notification) => n.target_type === filterType,
        );
      }

      setNotifications(filtered);
      setError(null);
    } catch (err) {
      setError("Netzwerkfehler beim Abrufen der Benachrichtigungen");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterType]);

  const handleOpenDetail = (notification: Notification): void => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const totalPages = Math.ceil(notifications.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedNotifications = notifications.slice(
    startIndex,
    startIndex + limit,
  );

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTargetTypeLabel = (
    type: string,
    targetId: number | null,
  ): string => {
    if (type === "all") return "Alle Nutzer";
    if (type === "single") return `Einzelnutzer (ID: ${targetId})`;
    return type;
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen overflow-y-auto mt-10">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-[90%] max-w-6xl text-center mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-400">
            Benachrichtigungsverlauf
          </h1>
          <div className="bg-blue-600 px-4 py-2 rounded-lg">
            <p className="text-white font-semibold">
              Gesamt: <span className="text-base">{notifications.length}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 justify-center items-center">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium cursor-pointer ${
              filterType === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setFilterType("all_users")}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium cursor-pointer ${
              filterType === "all_users"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Alle Nutzer
          </button>
          <button
            onClick={() => setFilterType("single")}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium cursor-pointer ${
              filterType === "single"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Einzelnutzer
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading && (
          <p className="text-gray-300 text-center py-4">Wird geladen...</p>
        )}

        {!loading && notifications.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            Keine Benachrichtigungen gefunden.
          </p>
        )}

        {!loading && notifications.length > 0 && (
          <>
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400 uppercase text-sm">
                  <th className="px-4 text-center">ID</th>
                  <th className="px-4 text-center">Betreff</th>
                  <th className="px-4 text-center">Zielgruppe</th>
                  <th className="px-4 text-center">Erstellt von</th>
                  <th className="px-4 text-center">Datum</th>
                  <th className="px-4 text-center">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNotifications.map((notification) => (
                  <tr key={notification.nid} className="group transition">
                    <td className="px-4 py-3 text-gray-200 font-bold bg-gray-700 group-hover:bg-gray-600 rounded-l-lg">
                      #{notification.nid}
                    </td>
                    <td className="px-4 py-3 text-gray-200 font-medium bg-gray-700 group-hover:bg-gray-600 truncate">
                      {notification.title}
                    </td>
                    <td className="px-4 py-3 text-gray-300 bg-gray-700 group-hover:bg-gray-600">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          notification.target_type === "all"
                            ? "bg-green-600/30 text-green-300"
                            : "bg-purple-600/30 text-purple-300"
                        }`}
                      >
                        {getTargetTypeLabel(
                          notification.target_type,
                          notification.target_id,
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 bg-gray-700 group-hover:bg-gray-600">
                      {notification.created_by || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm bg-gray-700 group-hover:bg-gray-600">
                      {formatDate(notification.created_at)}
                    </td>
                    <td className="px-4 py-3 bg-gray-700 group-hover:bg-gray-600 rounded-r-lg">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(notification)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Details anzeigen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 text-blue-400 transition duration-200 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 px-6 py-2 bg-gray-700 rounded-lg">
                  <span className="text-gray-200 font-bold text-lg">
                    {page}
                  </span>
                  <span className="text-blue-400 font-bold text-lg">...</span>
                  <span className="text-gray-400 font-semibold text-lg">
                    {totalPages}
                  </span>
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 text-blue-400 transition duration-200 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 border-b border-blue-600">
              <h2 className="text-2xl font-bold text-white">
                {selectedNotification.title}
              </h2>
              <p className="text-blue-100 text-sm mt-2">
                Benachrichtigungs-ID: #{selectedNotification.nid}
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                  Nachrichteninhalt
                </h3>
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <p className="text-gray-100 leading-relaxed text-base">
                    {selectedNotification.body}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">
                    Zielgruppe
                  </p>
                  <p className="text-lg font-bold text-blue-400">
                    {getTargetTypeLabel(
                      selectedNotification.target_type,
                      selectedNotification.target_id,
                    )}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">
                    Erstellt von
                  </p>
                  <p className="text-lg font-bold text-gray-100">
                    {selectedNotification.created_by || "-"}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 col-span-2">
                  <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">
                    Erstellt am
                  </p>
                  <p className="text-base text-gray-100">
                    {formatDate(selectedNotification.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 px-8 py-6 border-t border-gray-600 flex gap-3 justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition font-semibold cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-gray-500 text-sm mt-10">
        Nur angemeldete Admins können den Benachrichtigungsverlauf einsehen.
      </p>
    </div>
  );
}
