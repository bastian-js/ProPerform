import { useState, useRef } from "react";
import {
  CircleQuestionMark,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  FileIcon,
} from "lucide-react";
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

export default function AddExercise() {
  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [sportId, setSportId] = useState("");
  const [diffLevelId, setDiffLevelId] = useState("");
  const [duration, setDuration] = useState("");
  const [equipment, setEquipment] = useState("");

  // File States
  const [video, setVideo] = useState<FileState>({
    file: null,
    filename: "",
    extension: "",
    mid: null,
    uploading: false,
    uploadError: null,
    showSuccess: false,
  });

  const [thumbnail, setThumbnail] = useState<FileState>({
    file: null,
    filename: "",
    extension: "",
    mid: null,
    uploading: false,
    uploadError: null,
    showSuccess: false,
  });

  // Refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Extract extension
  const getExtension = (filename: string) => {
    const lastDot = filename.lastIndexOf(".");
    return lastDot === -1 ? "" : filename.slice(lastDot + 1);
  };

  const getNameWithoutExtension = (filename: string) => {
    const lastDot = filename.lastIndexOf(".");
    return lastDot === -1 ? filename : filename.slice(0, lastDot);
  };

  // Handle File Select
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "video" | "thumbnail",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setState = type === "video" ? setVideo : setThumbnail;
    const nameWithoutExt = getNameWithoutExtension(file.name);
    const ext = getExtension(file.name);

    setState((prev) => ({
      ...prev,
      file,
      filename: nameWithoutExt,
      extension: ext,
      uploadError: null,
    }));
  };

  // Handle Clear File
  const handleClearFile = (type: "video" | "thumbnail") => {
    const setState = type === "video" ? setVideo : setThumbnail;
    const inputRef = type === "video" ? videoInputRef : thumbnailInputRef;

    setState((prev) => ({
      ...prev,
      file: null,
      filename: "",
      extension: "",
      uploadError: null,
    }));

    if (inputRef.current) inputRef.current.value = "";
  };

  // Upload Handler
  async function handleUpload(type: "video" | "thumbnail") {
    const setState = type === "video" ? setVideo : setThumbnail;
    const getState = type === "video" ? () => video : () => thumbnail;
    const state = getState();

    if (!state.file) {
      setState((prev) => ({
        ...prev,
        uploadError: "Bitte wähle eine Datei aus",
      }));
      return;
    }

    setState((prev) => ({ ...prev, uploading: true, uploadError: null }));

    const token = localStorage.getItem("token");
    if (!token) {
      setState((prev) => ({
        ...prev,
        uploading: false,
        uploadError: "Kein Token vorhanden",
      }));
      return;
    }

    const formData = new FormData();
    const newFileName = `${state.filename}.${state.extension}`;

    const renamedFile = new File([state.file], newFileName, {
      type: state.file.type,
    });

    formData.append("file", renamedFile);

    try {
      const res = await authFetch("https://api.properform.app/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data?.mid) {
        setState((prev) => ({
          ...prev,
          mid: data.mid,
          uploading: false,
          showSuccess: true,
        }));

        setTimeout(() => {
          setState((prev) => ({ ...prev, showSuccess: false }));
        }, 4000);
      } else {
        setState((prev) => ({
          ...prev,
          uploading: false,
          uploadError: data?.error || "Upload fehlgeschlagen",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        uploading: false,
        uploadError:
          error instanceof Error ? error.message : "Upload fehlgeschlagen",
      }));
    }
  }

  // Handle Form Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Kein Token vorhanden");
      return;
    }

    if (!video.mid || !thumbnail.mid) {
      alert("Bitte lade Video und Thumbnail hoch");
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
          video_mid: video.mid,
          thumbnail_mid: thumbnail.mid,
          sid: Number(sportId),
          dlid: Number(diffLevelId),
          duration_minutes: Number(duration),
          equipment_needed: equipment,
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
      setThumbnail({
        file: null,
        filename: "",
        extension: "",
        mid: null,
        uploading: false,
        uploadError: null,
        showSuccess: false,
      });
      setSportId("");
      setDiffLevelId("");
      setDuration("");
      setEquipment("");
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    } else {
      alert(data?.error || "Fehler beim Erstellen");
    }
  }

  const isReady = video.mid && thumbnail.mid;

  return (
    <div className="flex justify-center w-full mt-5 mb-5">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-[90%] max-w-3xl w-[90%] max-w-3xl">
        <h1 className="text-3xl font-bold text-blue-400 mb-2 text-center">
          Create Exercise
        </h1>
        <p className="text-center text-gray-400 text-sm mb-8">Nur für Admins</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Title & Duration */}
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
                required
                min="1"
                className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                placeholder="10"
              />
            </div>
          </div>

          {/* Description */}
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

          {/* Instructions */}
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

          {/* VIDEO UPLOAD */}
          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
              Video
            </label>

            {/* Drop Zone */}
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 transition-all duration-300 cursor-pointer border-gray-600 hover:border-blue-400 relative bg-gray-700/30 group mb-3"
            >
              {video.file && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile("video");
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
                onChange={(e) => handleFileSelect(e, "video")}
                className="hidden"
              />
            </div>

            {/* Video Filename Input */}
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

            {/* Video Upload Button */}
            {video.file && !video.mid && (
              <button
                type="button"
                onClick={() => handleUpload("video")}
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

            {/* Video Messages */}
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
                <p className="font-semibold">✓ Video hochgeladen</p>
              </div>
            )}
          </div>

          {/* THUMBNAIL UPLOAD */}
          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
              Thumbnail
            </label>

            {/* Drop Zone */}
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 transition-all duration-300 cursor-pointer border-gray-600 hover:border-blue-400 relative bg-gray-700/30 group mb-3"
            >
              {thumbnail.file && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile("thumbnail");
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

                {thumbnail.file ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <FileIcon className="w-4 h-4 text-blue-400" />
                      <p className="font-semibold text-gray-100">
                        {thumbnail.file.name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-400">
                      {(thumbnail.file.size / 1024 / 1024).toFixed(2)} MB
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
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, "thumbnail")}
                className="hidden"
              />
            </div>

            {/* Thumbnail Filename Input */}
            {thumbnail.file && (
              <div className="flex flex-col mb-3">
                <label className="text-xs mb-2 text-gray-400">
                  Dateiname (Extension wird automatisch hinzugefügt)
                </label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={thumbnail.filename}
                      onChange={(e) =>
                        setThumbnail((prev) => ({
                          ...prev,
                          filename: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
                      placeholder="thumbnail-name"
                    />
                  </div>
                  <span className="text-gray-400 text-sm px-3 py-3 bg-gray-700 rounded-lg">
                    .{thumbnail.extension}
                  </span>
                </div>
              </div>
            )}

            {/* Thumbnail Upload Button */}
            {thumbnail.file && !thumbnail.mid && (
              <button
                type="button"
                onClick={() => handleUpload("thumbnail")}
                disabled={thumbnail.uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mb-3"
              >
                {thumbnail.uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Wird hochgeladen...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Thumbnail hochladen</span>
                  </>
                )}
              </button>
            )}

            {/* Thumbnail Messages */}
            {thumbnail.uploadError && (
              <div className="mb-3 bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{thumbnail.uploadError}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setThumbnail((prev) => ({ ...prev, uploadError: null }))
                  }
                  className="text-red-300 hover:text-red-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {thumbnail.mid && (
              <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
                <p className="font-semibold">✓ Thumbnail hochgeladen</p>
              </div>
            )}
          </div>

          {/* Row 2: IDs */}
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

          {/* Equipment */}
          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
              Equipment
            </label>
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
              placeholder="Chest Machine"
            />
          </div>

          {/* Submit Button */}
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
              <span>Video & Thumbnail erforderlich</span>
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
