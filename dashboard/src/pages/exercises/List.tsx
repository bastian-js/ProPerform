import { useEffect, useState } from "react";
import { Trash, ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";
import authFetch from "../../functions/authFetch";

const BASE_URL = "https://api.properform.app";
//const BASE_URL = "http://localhost:3000";

interface Exercise {
  eid: string;
  name: string;
  created_by: string;
  duration_minutes?: number;
  description?: string;
  instructions?: string;
  video_url?: string;
  thumbnail_url?: string;
  sid?: number;
  dlid?: number;
  equipment_needed?: string;
}

interface FormData {
  name: string;
  duration_minutes: string;
  description: string;
  instructions: string;
  video_url: string;
  thumbnail_url: string;
  sid: string;
  dlid: string;
  equipment_needed: string;
}

export default function ExercisesList() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const limit: number = 10;

  const [formData, setFormData] = useState<FormData>({
    name: "",
    duration_minutes: "",
    description: "",
    instructions: "",
    video_url: "",
    thumbnail_url: "",
    sid: "",
    dlid: "",
    equipment_needed: "",
  });

  const fetchExercises = async (): Promise<void> => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Kein Token vorhanden – bitte zuerst anmelden.");
      setLoading(false);
      return;
    }

    try {
      const res = await authFetch(
        `${BASE_URL}/exercises?page=${page}&limit=${limit}`,
      );

      if (!res.ok) {
        setError("Fehler beim Abrufen der Übungen");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setExercises(data.exercises || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      setError("Netzwerkfehler beim Abrufen der Übungen");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [page]);

  const handleOpenUpdate = async (eid: string): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Kein Token vorhanden – bitte zuerst anmelden.");
      return;
    }

    try {
      const res = await authFetch(`${BASE_URL}/admin/exercises/${eid}`);

      if (!res.ok) throw new Error("Fehler beim Laden der Übung");

      const exercise = await res.json();

      setFormData({
        name: exercise.name || "",
        duration_minutes: exercise.duration_minutes?.toString() || "",
        description: exercise.description || "",
        instructions: exercise.instructions || "",
        video_url: exercise.video_url || "",
        thumbnail_url: exercise.thumbnail_url || "",
        sid: exercise.sid?.toString() || "",
        dlid: exercise.dlid?.toString() || "",
        equipment_needed: exercise.equipment_needed || "",
      });

      setSelectedExercise(exercise);
      setShowUpdateModal(true);
    } catch (err) {
      setError("Fehler beim Laden der Übung");
      console.error(err);
    }
  };

  const handleUpdate = async (): Promise<void> => {
    if (!selectedExercise) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Kein Token vorhanden – bitte zuerst anmelden.");
      return;
    }

    try {
      setIsUpdating(true);

      const payload = {
        name: formData.name,
        duration_minutes: parseInt(formData.duration_minutes),
        description: formData.description,
        instructions: formData.instructions,
        video_url: formData.video_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        sid: parseInt(formData.sid),
        dlid: parseInt(formData.dlid),
        equipment_needed: formData.equipment_needed || null,
      };

      const res = await authFetch(
        `${BASE_URL}/admin/exercises/${selectedExercise.eid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Fehler beim Update");
      }

      setShowUpdateModal(false);
      fetchExercises();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Aktualisieren der Übung",
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
      const res = await authFetch(
        `${BASE_URL}/admin/exercises/${deleteTarget}`,
        { method: "DELETE" },
      );

      if (!res.ok) throw new Error("Fehler beim Löschen");

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchExercises();
    } catch (err) {
      setError("Fehler beim Löschen der Übung");
      console.error(err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen overflow-y-auto mt-10">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-[90%] max-w-6xl text-center mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-400">Übungsverwaltung</h1>
          <div className="bg-blue-600 px-4 py-2 rounded-lg">
            <p className="text-white font-semibold">
              Gesamt: <span className="text-base">{total}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading && (
          <p className="text-gray-300 text-center py-4">Wird geladen...</p>
        )}

        {!loading && exercises.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            Keine Übungen gefunden.
          </p>
        )}

        {!loading && exercises.length > 0 && (
          <>
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400 uppercase text-sm">
                  <th className="px-4 text-center">ID</th>
                  <th className="px-4 text-center">Name</th>
                  <th className="px-4 text-center">Erstellt von</th>
                  <th className="px-4 text-center">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => (
                  <tr key={exercise.eid} className="group transition">
                    <td className="px-4 py-3 text-gray-200 font-bold bg-gray-700 group-hover:bg-gray-600 rounded-l-lg">
                      {exercise.eid}
                    </td>
                    <td className="px-4 py-3 text-gray-200 font-medium bg-gray-700 group-hover:bg-gray-600">
                      {exercise.name}
                    </td>
                    <td className="px-4 py-3 text-gray-300 bg-gray-700 group-hover:bg-gray-600">
                      {exercise.created_by || "-"}
                    </td>
                    <td className="px-4 py-3 bg-gray-700 group-hover:bg-gray-600 rounded-r-lg">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenUpdate(exercise.eid)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Bearbeiten"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(exercise.eid);
                            setShowDeleteConfirm(true);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Löschen"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-center items-center gap-6 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 text-blue-400 transition duration-200 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 px-6 py-2 bg-gray-700 rounded-lg">
                <span className="text-gray-200 font-bold text-lg">{page}</span>
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
          </>
        )}
      </div>

      {/* Update Modal - Fullscreen */}
      {showUpdateModal && selectedExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl w-full h-full max-w-5xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gray-700 px-8 py-6 flex justify-between items-center border-b border-gray-600">
              <h2 className="text-2xl font-bold text-white">
                Übung bearbeiten
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
              {/* Titel */}
              <div className="flex flex-col">
                <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                  Titel
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                  placeholder="Chest Press"
                />
              </div>

              {/* Duration */}
              <div className="flex flex-col">
                <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                  Duration (in mins)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                  placeholder="10"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition resize-none"
                  placeholder="Description..."
                />
              </div>

              {/* Instructions */}
              <div className="flex flex-col">
                <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                  Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition resize-none"
                  placeholder="Instructions..."
                />
              </div>

              {/* Video URL */}
              <div className="flex flex-col">
                <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                  Video URL
                </label>
                <input
                  type="text"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                  placeholder="youtube.com/watch?v=..."
                />
              </div>

              {/* Thumbnail URL */}
              <div className="flex flex-col">
                <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  name="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                  placeholder="Thumbnail-URL"
                />
              </div>

              {/* Sport ID (sid) */}
              <div className="flex flex-col">
                <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                  Sport-ID (sid)
                </label>
                <input
                  type="number"
                  name="sid"
                  value={formData.sid}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                  placeholder="1"
                />
              </div>

              {/* Difficulty Level ID (dlid) */}
              <div className="flex flex-col">
                <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                  Difficulty-Level-ID (dlid)
                </label>
                <input
                  type="number"
                  name="dlid"
                  value={formData.dlid}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                  placeholder="3"
                />
              </div>

              {/* Equipment */}
              <div className="flex flex-col">
                <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                  Equipment
                </label>
                <input
                  type="text"
                  name="equipment_needed"
                  value={formData.equipment_needed}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                  placeholder="Chest Machine"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-700 px-8 py-6 border-t border-gray-600 flex gap-3 justify-end">
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
                Bist du sicher, dass du diese Übung löschen möchtest? Diese
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
        Nur angemeldete Admins können Übungen einsehen und verwalten.
      </p>
    </div>
  );
}
