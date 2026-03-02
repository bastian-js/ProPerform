import { useEffect, useState } from "react";
import { Trash, Pencil, X, Image, Video, ExternalLink } from "lucide-react";
import authFetch from "../../functions/authFetch";

const BASE_URL = "https://api.properform.app";

interface MediaFile {
  mid: number;
  type: "image" | "video";
  filename: string;
  url: string;
  size: number;
  created_at: string;
}

interface MediaResponse {
  count: number;
  media: MediaFile[];
}

interface FormData {
  filename: string;
}

export default function MediaList() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  const [formData, setFormData] = useState<FormData>({
    filename: "",
  });

  const fetchMedia = async (): Promise<void> => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Kein Token vorhanden – bitte zuerst anmelden.");
      setLoading(false);
      return;
    }

    try {
      const res = await authFetch(`${BASE_URL}/media`);

      if (!res.ok) {
        setError("Fehler beim Abrufen der Medien");
        setLoading(false);
        return;
      }

      const data: MediaResponse = await res.json();
      setMedia(data.media || []);
      setTotal(data.count || 0);
      setError(null);
    } catch (err) {
      setError("Netzwerkfehler beim Abrufen der Medien");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleOpenUpdate = (file: MediaFile): void => {
    // Remove extension from filename for display
    const nameWithoutExt = file.filename.replace(/\.[^/.]+$/, "");
    setSelectedMedia(file);
    setFormData({
      filename: nameWithoutExt,
    });
    setShowUpdateModal(true);
  };

  const handleUpdate = async (): Promise<void> => {
    if (!selectedMedia) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Kein Token vorhanden – bitte zuerst anmelden.");
      return;
    }

    try {
      setIsUpdating(true);

      const ext = getFileExtension();
      const filenameWithExt = formData.filename + ext;

      const payload = {
        filename: filenameWithExt,
      };

      const res = await authFetch(`${BASE_URL}/media/${selectedMedia.mid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Fehler beim Update");
      }

      setShowUpdateModal(false);
      fetchMedia();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Aktualisieren der Datei",
      );
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Kein Token vorhanden – bitte zuerst anmelden.");
      return;
    }

    try {
      const res = await authFetch(`${BASE_URL}/media/${deleteTarget}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Fehler beim Löschen");

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchMedia();
    } catch (err) {
      setError("Fehler beim Löschen der Datei");
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    // Remove any extension from input
    const nameWithoutExt = value.replace(/\.[^/.]+$/, "");
    setFormData((prev) => ({
      ...prev,
      [name]: nameWithoutExt,
    }));
  };

  const getFileExtension = (): string => {
    if (!selectedMedia) return "";
    const filename = selectedMedia.filename;
    const ext = filename.substring(filename.lastIndexOf("."));
    return ext;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: "image" | "video") => {
    if (type === "image") {
      return <Image className="w-4 h-4 text-blue-400" />;
    } else {
      return <Video className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen overflow-y-auto mt-10">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-[90%] max-w-6xl text-center mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-400">Medienverwaltung</h1>
          <div className="bg-blue-600 px-4 py-2 rounded-lg">
            <p className="text-white font-semibold">
              Gesamt: <span className="text-base">{total}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6 flex items-center justify-between">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-300 hover:text-red-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading && (
          <p className="text-gray-300 text-center py-4">Wird geladen...</p>
        )}

        {!loading && media.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            Keine Medien gefunden.
          </p>
        )}

        {!loading && media.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-gray-400 uppercase text-sm">
                    <th className="px-4 py-2 text-center w-12">ID</th>
                    <th className="px-4 py-2 text-left">Dateiname</th>
                    <th className="px-4 py-2 text-center w-20">Typ</th>
                    <th className="px-4 py-2 text-center w-24">Größe</th>
                    <th className="px-4 py-2 text-center w-32">Erstellt am</th>
                    <th className="px-4 py-2 text-center w-16">URL</th>
                    <th className="px-4 py-2 text-center w-24">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {media.map((file) => (
                    <tr key={file.mid} className="group transition">
                      <td className="px-4 py-3 text-gray-200 font-bold bg-gray-700 group-hover:bg-gray-600 rounded-l-lg text-center w-12">
                        {file.mid}
                      </td>
                      <td className="px-4 py-3 text-gray-200 font-medium bg-gray-700 group-hover:bg-gray-600 break-all whitespace-normal max-w-xs">
                        {file.filename}
                      </td>
                      <td className="px-4 py-3 text-gray-300 bg-gray-700 group-hover:bg-gray-600 text-center w-20">
                        {getTypeIcon(file.type)}
                      </td>
                      <td className="px-4 py-3 text-gray-300 bg-gray-700 group-hover:bg-gray-600 text-center w-24">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-4 py-3 text-gray-300 bg-gray-700 group-hover:bg-gray-600 text-sm text-center w-32">
                        {formatDate(file.created_at)}
                      </td>
                      <td className="px-4 py-3 bg-gray-700 group-hover:bg-gray-600 text-center w-16">
                        <button
                          onClick={() => window.open(file.url, "_blank")}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm px-2 py-1 rounded-lg transition cursor-pointer inline-flex items-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-3 bg-gray-700 group-hover:bg-gray-600 rounded-r-lg text-center w-24">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenUpdate(file)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-2 py-1 rounded-lg transition cursor-pointer inline-flex items-center"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget(file.mid);
                              setShowDeleteConfirm(true);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm px-2 py-1 rounded-lg transition cursor-pointer inline-flex items-center"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl">
            {/* Header */}
            <div className="bg-gray-700 px-8 py-6 flex justify-between items-center border-b border-gray-600">
              <h2 className="text-2xl font-bold text-white">
                Datei bearbeiten
              </h2>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <div className="p-8 space-y-6">
              {/* Filename */}
              <div className="flex flex-col">
                <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                  Dateiname
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="filename"
                    value={formData.filename}
                    onChange={handleInputChange}
                    className="flex-1 px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                    placeholder="Name ohne Extension"
                  />
                  <div className="px-5 py-3 rounded-xl bg-gray-600 text-gray-300 flex items-center font-semibold">
                    {getFileExtension()}
                  </div>
                </div>
              </div>

              {/* Current Info */}
              <div className="bg-gray-700 p-4 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">
                  <span className="font-semibold">Typ:</span>{" "}
                  {selectedMedia.type === "image" ? "Bild" : "Video"}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  <span className="font-semibold">Größe:</span>{" "}
                  {formatFileSize(selectedMedia.size)}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="font-semibold">URL:</span>
                  <code className="bg-gray-600 px-2 py-1 rounded text-xs ml-2">
                    {selectedMedia.url}
                  </code>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-700 px-8 py-6 border-t border-gray-600 flex gap-3 justify-end">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition font-semibold cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 font-semibold cursor-pointer"
              >
                {isUpdating ? "Wird gespeichert..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl max-w-sm w-full">
            <div className="px-6 py-4 border-b border-gray-600">
              <h2 className="text-xl font-bold text-white">Bestätigung</h2>
            </div>

            <div className="px-6 py-6">
              <p className="text-gray-300">
                Bist du sicher, dass du diese Datei löschen möchtest? Diese
                Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-600 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-gray-500 text-sm mt-10">
        Nur angemeldete Admins können Medien einsehen und verwalten.
      </p>
    </div>
  );
}
