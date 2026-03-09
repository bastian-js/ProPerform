import { useState, useRef, useEffect } from "react";
import {
  CircleQuestionMark,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  FileIcon,
} from "lucide-react";
import ToggleSwitch from "../../components/ToggleSwitch";
import authFetch from "../../functions/authFetch";

interface FileState {
  file: File | null;
  filename: string;
  extension: string;
  mid: number | null;
  uploading: boolean;
  uploadError: string | null;
  showSuccess: boolean;
}

interface MuscleGroup {
  mgid: number;
  is_primary: number;
}

interface MuscleGroupOption {
  mgid: number;
  name: string;
}

export default function AddExercise() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [sportId, setSportId] = useState("");
  const [diffLevelId, setDiffLevelId] = useState("");
  const [duration, setDuration] = useState("");
  const [equipment, setEquipment] = useState("");
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [selectedMgid, setSelectedMgid] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [muscleGroupOptions, setMuscleGroupOptions] = useState<
    MuscleGroupOption[]
  >([]);
  const [loadingMg, setLoadingMg] = useState(true);

  const [videoMode, setVideoMode] = useState(true);
  const [videoId, setVideoId] = useState("");

  const [video, setVideo] = useState<FileState>({
    file: null,
    filename: "",
    extension: "",
    mid: null,
    uploading: false,
    uploadError: null,
    showSuccess: false,
  });

  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMuscleGroups = async () => {
      try {
        const res = await authFetch("https://api.properform.app/muscle-groups");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setMuscleGroupOptions(data);
        }
      } catch (error) {
        console.error("Failed to load muscle groups:", error);
      } finally {
        setLoadingMg(false);
      }
    };

    fetchMuscleGroups();
  }, []);

  const getExtension = (filename: string) => {
    const lastDot = filename.lastIndexOf(".");
    return lastDot === -1 ? "" : filename.slice(lastDot + 1);
  };

  const getNameWithoutExtension = (filename: string) => {
    const lastDot = filename.lastIndexOf(".");
    return lastDot === -1 ? filename : filename.slice(0, lastDot);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameWithoutExt = getNameWithoutExtension(file.name);
    const ext = getExtension(file.name);

    setVideo((prev) => ({
      ...prev,
      file,
      filename: nameWithoutExt,
      extension: ext,
      uploadError: null,
    }));
  };

  const handleClearFile = () => {
    setVideo((prev) => ({
      ...prev,
      file: null,
      filename: "",
      extension: "",
      uploadError: null,
    }));

    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  async function handleUpload() {
    if (!video.file) {
      setVideo((prev) => ({
        ...prev,
        uploadError: "Bitte wähle eine Datei aus",
      }));
      return;
    }

    setVideo((prev) => ({ ...prev, uploading: true, uploadError: null }));

    const token = localStorage.getItem("token");
    if (!token) {
      setVideo((prev) => ({
        ...prev,
        uploading: false,
        uploadError: "Kein Token vorhanden",
      }));
      return;
    }

    const formData = new FormData();
    const newFileName = `${video.filename}.${video.extension}`;

    const renamedFile = new File([video.file], newFileName, {
      type: video.file.type,
    });

    formData.append("file", renamedFile);

    try {
      const res = await authFetch("https://api.properform.app/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data?.mid) {
        setVideo((prev) => ({
          ...prev,
          mid: data.mid,
          uploading: false,
          showSuccess: true,
        }));

        setTimeout(() => {
          setVideo((prev) => ({ ...prev, showSuccess: false }));
        }, 4000);
      } else {
        setVideo((prev) => ({
          ...prev,
          uploading: false,
          uploadError: data?.error || "Upload fehlgeschlagen",
        }));
      }
    } catch (error) {
      setVideo((prev) => ({
        ...prev,
        uploading: false,
        uploadError:
          error instanceof Error ? error.message : "Upload fehlgeschlagen",
      }));
    }
  }

  const handleAddMuscleGroup = () => {
    if (!selectedMgid) {
      alert("Bitte wähle eine Muskelgruppe aus");
      return;
    }

    const alreadyAdded = muscleGroups.some(
      (mg) => mg.mgid === Number(selectedMgid),
    );
    if (alreadyAdded) {
      alert("Diese Muskelgruppe wurde bereits hinzugefügt");
      return;
    }

    const newMg: MuscleGroup = {
      mgid: Number(selectedMgid),
      is_primary: isPrimary ? 1 : 0,
    };

    setMuscleGroups([...muscleGroups, newMg]);
    setSelectedMgid("");
    setIsPrimary(false);
  };

  const handleRemoveMuscleGroup = (index: number) => {
    setMuscleGroups(muscleGroups.filter((_, i) => i !== index));
  };

  const getMuscleGroupName = (mgid: number) => {
    return (
      muscleGroupOptions.find((mg) => mg.mgid === mgid)?.name || `ID: ${mgid}`
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Kein Token vorhanden");
      return;
    }

    const finalVideoMid = videoMode
      ? video.mid
      : videoId
        ? Number(videoId)
        : null;

    if (!finalVideoMid) {
      alert("Bitte lade Video hoch oder gib seine ID ein");
      return;
    }

    if (!sportId || !diffLevelId) {
      alert("Sport-ID und Difficulty-Level-ID sind erforderlich");
      return;
    }

    const res = await authFetch(
      "https://api.properform.app/admin/exercises/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          instructions,
          video_mid: finalVideoMid,
          sid: Number(sportId),
          dlid: Number(diffLevelId),
          duration_minutes: duration ? Number(duration) : null,
          equipment_needed: equipment,
          muscle_groups: muscleGroups.length > 0 ? muscleGroups : undefined,
        }),
      },
    );

    const data = await res.json();
    if (res.ok) {
      alert(`✅ Übung ${name} erstellt!`);
      setName("");
      setDescription("");
      setInstructions("");
      setVideo({
        file: null,
        filename: "",
        extension: "",
        mid: null,
        uploading: false,
        uploadError: null,
        showSuccess: false,
      });
      setVideoId("");
      setSportId("");
      setDiffLevelId("");
      setDuration("");
      setEquipment("");
      setMuscleGroups([]);
      setSelectedMgid("");
      setIsPrimary(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    } else {
      alert(data?.error || "Fehler beim Erstellen");
    }
  }

  const isReady = videoMode ? video.mid : videoId;

  return (
    <div className="flex justify-center w-full mt-5 mb-5">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-[90%] max-w-3xl">
        <h1 className="text-3xl font-bold text-blue-400 mb-2 text-center">
          Create Exercise
        </h1>
        <p className="text-center text-gray-400 text-sm mb-8">Nur für Admins</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                Titel
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                placeholder="Chest Press"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
                Duration (mins)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition resize-none"
              placeholder="Description..."
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              rows={3}
              className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition resize-none"
              placeholder="Instructions..."
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-300 tracking-wide font-semibold">
                Video
              </label>
              <ToggleSwitch
                checked={videoMode}
                onChange={(checked) => {
                  setVideoMode(checked);
                  if (checked) {
                    setVideoId("");
                  } else {
                    setVideo({
                      file: null,
                      filename: "",
                      extension: "",
                      mid: null,
                      uploading: false,
                      uploadError: null,
                      showSuccess: false,
                    });
                  }
                }}
                leftLabel="ID"
                rightLabel="Hochladen"
              />
            </div>

            {videoMode ? (
              <>
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-10 transition-all duration-300 cursor-pointer border-gray-600 hover:border-blue-400 relative bg-gray-700/30 group mb-3"
                >
                  {video.file && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearFile();
                      }}
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full transition-all cursor-pointer hover:scale-110"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 rounded-lg bg-gray-700">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>

                    {video.file ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <FileIcon className="w-4 h-4 text-blue-400" />
                          <p className="font-semibold text-gray-100">
                            {video.file.name}
                          </p>
                        </div>
                        <p className="text-sm text-gray-400">
                          {(video.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-200 font-semibold mb-1">
                          Datei auswählen oder ablegen
                        </p>
                        <p className="text-sm text-gray-400">
                          Klick oder Drag & Drop
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {video.file && (
                  <div className="flex flex-col mb-3">
                    <label className="text-xs mb-2 text-gray-400">
                      Dateiname (Extension wird automatisch hinzugefügt)
                    </label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={video.filename}
                          onChange={(e) =>
                            setVideo((prev) => ({
                              ...prev,
                              filename: e.target.value,
                            }))
                          }
                          className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                          placeholder="video-name"
                        />
                      </div>
                      <span className="text-gray-400 text-sm px-3 py-3 bg-gray-700 rounded-lg">
                        .{video.extension}
                      </span>
                    </div>
                  </div>
                )}

                {video.file && !video.mid && (
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={video.uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mb-3"
                  >
                    {video.uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Wird hochgeladen...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Video hochladen</span>
                      </>
                    )}
                  </button>
                )}

                {video.uploadError && (
                  <div className="mb-3 bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>{video.uploadError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setVideo((prev) => ({ ...prev, uploadError: null }))
                      }
                      className="text-red-300 hover:text-red-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {video.mid && (
                  <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
                    <p className="font-semibold">
                      ✓ Video hochgeladen (ID: {video.mid})
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col">
                <input
                  type="number"
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  placeholder="Video ID eingeben..."
                  className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                />
                {videoId && (
                  <div className="mt-3 bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
                    <p className="font-semibold">✓ Video ID: {videoId}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="mb-2 text-sm text-gray-400 tracking-wide flex items-center gap-2">
                Sport-ID
                <div className="relative group">
                  <CircleQuestionMark className="w-4 h-4 text-gray-400 cursor-pointer" />
                  <div
                    className="absolute left-6 top-1/2 -translate-y-1/2
                        w-56 rounded-lg bg-[#1E2747] px-3 py-2 text-xs text-white
                        opacity-0 group-hover:opacity-100 transition
                        pointer-events-none shadow-lg"
                  >
                    Eindeutige ID der Sportart. Beispiel: 1 = Gym, 2 =
                    Basketball
                  </div>
                </div>
              </label>
              <input
                type="number"
                value={sportId}
                onChange={(e) => setSportId(e.target.value)}
                required
                min="1"
                className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                placeholder="1"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-sm text-gray-400 tracking-wide flex items-center gap-2">
                Difficulty-Level-ID
                <div className="relative group">
                  <CircleQuestionMark className="w-4 h-4 text-gray-400 cursor-pointer" />
                  <div
                    className="absolute left-6 top-1/2 -translate-y-1/2
                        w-56 rounded-lg bg-[#1E2747] px-3 py-2 text-xs text-white
                        opacity-0 group-hover:opacity-100 transition
                        pointer-events-none shadow-lg"
                  >
                    Eindeutige ID des Difficulty-Level. Beispiel: 1 = Beginner,
                    2 = Intermediate, 3 = Advanced, 4 = Expert.
                  </div>
                </div>
              </label>
              <input
                type="number"
                value={diffLevelId}
                onChange={(e) => setDiffLevelId(e.target.value)}
                required
                min="1"
                max="4"
                className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                placeholder="3"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
              Equipment
            </label>
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
              placeholder="Chest Machine"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
              Muscle Groups (optional)
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={selectedMgid}
                  onChange={(e) => setSelectedMgid(e.target.value)}
                  disabled={loadingMg}
                  className="flex-1 px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingMg ? "Laden..." : "Muskelgruppe wählen"}
                  </option>
                  {muscleGroupOptions.map((mg) => (
                    <option key={mg.mgid} value={mg.mgid}>
                      {mg.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsPrimary(!isPrimary)}
                  className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isPrimary
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 transition-all ${
                      isPrimary ? "scale-100" : "scale-75"
                    }`}
                    fill={isPrimary ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Primary</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddMuscleGroup}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition cursor-pointer"
                >
                  Add
                </button>
              </div>

              {muscleGroups.length > 0 && (
                <div className="bg-gray-700/50 rounded-xl p-4 space-y-2">
                  {muscleGroups.map((mg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
                    >
                      <span className="text-gray-200 flex items-center gap-2">
                        {getMuscleGroupName(mg.mgid)}
                        {mg.is_primary === 1 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            Primary
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMuscleGroup(idx)}
                        className="text-red-400 hover:text-red-300 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isReady}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isReady ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Übung erstellen</span>
              </>
            ) : (
              <span>Video erforderlich</span>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">
          Nur angemeldete Admins können Übungen erstellen.
        </p>
      </div>
    </div>
  );
}
