import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import {
  Sun,
  Moon,
  LogOut,
  Dumbbell,
  Video,
  Plus,
  UserMinus,
  Upload,
  X,
  Film,
  Zap,
  ChevronRight,
  Users,
  Search,
  Check,
  LayoutDashboard,
  Copy,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

type Athlete = { uid: string; firstname: string; email: string };
type VideoItem = { id: string; name: string };
type Exercise = { eid: string; name: string; duration_minutes?: number };
type UploadedMedia = {
  mid: string;
  url: string;
  filename?: string;
};
type TrainerRequest = {
  id: string;
  status: "pending" | "accepted" | "rejected" | string;
  created_at: string;
  uid: string;
  firstname: string;
  lastname?: string;
  email?: string;
};
type Tab = "overview" | "athletes" | "exercises" | "requests" | "videos";
type ModalType =
  | "exercise"
  | "createExercise"
  | "videoUpload"
  | "videoAssign"
  | "kick"
  | null;

type ExerciseFormState = {
  name: string;
  description: string;
  sid: string;
  dlid: string;
};

type RequestFilter = "all" | "pending" | "accepted" | "rejected";

function Spinner() {
  return (
    <div className="w-10 h-10 rounded-full border-4 border-[#F97316]/20 border-t-[#F97316] animate-[spin_0.8s_linear_infinite]" />
  );
}

function Modal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-200 px-0 sm:px-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md">
        {children}
      </div>
    </div>
  );
}

const modalCard =
  "bg-white dark:bg-[#1E293B] rounded-t-2xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-xl";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-orange-500 text-white font-semibold py-2.5 px-5 rounded-xl border-0 cursor-pointer transition-colors text-sm";
const ghostBtn =
  "inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-[#1E3A8A] dark:text-white font-semibold py-2.5 px-5 rounded-xl border-0 cursor-pointer transition-colors text-sm";

const LEVEL_COLORS: Record<string, string> = {
  Profi: "bg-[#F97316]/10 text-[#F97316]",
  Fortgeschritten: "bg-blue-50 dark:bg-blue-500/10 text-blue-500",
  Anfänger:
    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const REQUEST_STATUS_COLORS: Record<string, string> = {
  pending:
    "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
  accepted:
    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

function formatRequestStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getLevel(email: string) {
  const parts = email.split(" • ");
  return parts.length === 2
    ? { level: parts[0], name: parts[1] }
    : { level: "", name: email };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [athleteSearch, setAthleteSearch] = useState("");
  const [requestFilter, setRequestFilter] = useState<RequestFilter>("all");
  const [trainerRequests, setTrainerRequests] = useState<TrainerRequest[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([
    { id: "v1", name: "Basic Dribbling Tutorial.mp4" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [athleteList, setAthleteList] = useState<Athlete[]>([]);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exerciseVideoMedia, setExerciseVideoMedia] =
    useState<UploadedMedia | null>(null);
  const [exerciseThumbnailMedia, setExerciseThumbnailMedia] =
    useState<UploadedMedia | null>(null);
  const [isUploadingExerciseMedia, setIsUploadingExerciseMedia] = useState<
    "video" | "thumbnail" | null
  >(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedTrainerCode, setCopiedTrainerCode] = useState(false);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null,
  );
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormState>({
    name: "",
    description: "",
    sid: "",
    dlid: "",
  });

  const trainerCode = localStorage.getItem("inviteCode") ?? "-";

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token: string) => {
    try {
      const trainerId = localStorage.getItem("trainerId");
      const [exerciseResponse, requestResponse, athleteResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/exercises?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/trainers/requests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          trainerId
            ? fetch(`${API_BASE_URL}/trainers/${trainerId}/athletes`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve(null),
        ]);

      const [exerciseData, requestData] = await Promise.all([
        exerciseResponse.json(),
        requestResponse.json(),
      ]);

      const athleteData = athleteResponse ? await athleteResponse.json() : null;

      setExercises(exerciseData?.exercises || []);
      setTrainerRequests(requestData?.requests || []);
      setAthleteList(athleteData?.athletes || []);
    } catch (error) {
      console.error("Fehler:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExercises = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/exercises?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExercises(data?.exercises || []);
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  const fetchTrainerRequests = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/trainers/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTrainerRequests(data?.requests || []);
    } catch (error) {
      console.error("Requests konnten nicht geladen werden:", error);
    }
  };

  const fetchConnectedAthletes = async (token: string) => {
    const trainerId = localStorage.getItem("trainerId");
    if (!trainerId) {
      setAthleteList([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/trainers/${trainerId}/athletes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setAthleteList(data?.athletes || []);
    } catch (error) {
      console.error("Athleten konnten nicht geladen werden:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleCopyTrainerCode = async () => {
    if (!trainerCode || trainerCode === "-") return;
    try {
      await navigator.clipboard.writeText(trainerCode);
      setCopiedTrainerCode(true);
      setTimeout(() => setCopiedTrainerCode(false), 1500);
    } catch (error) {
      console.error("Trainer-Code konnte nicht kopiert werden:", error);
    }
  };

  const handleRegenerateTrainerCode = () => {
    // TODO: Trainer-Code neu generieren (Backend-Endpoint integrieren)
  };

  const resetExerciseForm = () => {
    setExerciseForm({
      name: "",
      description: "",
      sid: "",
      dlid: "",
    });
    setExerciseVideoMedia(null);
    setExerciseThumbnailMedia(null);
  };

  const openCreateExerciseModal = () => {
    resetExerciseForm();
    setActiveModal("createExercise");
  };

  const openRequestsTab = (filter: RequestFilter = "all") => {
    setRequestFilter(filter);
    setActiveTab("requests");
  };

  const openPendingRequestsTab = () => {
    openRequestsTab("pending");
  };

  const closeCreateExerciseModal = () => {
    setActiveModal(null);
    resetExerciseForm();
  };

  const uploadExerciseMedia = async (
    file: File,
    kind: "video" | "thumbnail",
  ) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingExerciseMedia(kind);

    try {
      const response = await fetch(`${API_BASE_URL}/media`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Media konnte nicht hochgeladen werden.",
        );
      }

      return {
        mid: String(data.mid),
        url: String(data.url),
        filename: file.name,
      } satisfies UploadedMedia;
    } catch (error) {
      console.error("Media konnte nicht hochgeladen werden:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Media konnte nicht hochgeladen werden.",
      );
      return null;
    } finally {
      setIsUploadingExerciseMedia(null);
    }
  };

  const pickExerciseMedia = (kind: "video" | "thumbnail") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "video" ? "video/*" : "image/*";
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      const uploadedMedia = await uploadExerciseMedia(file, kind);
      if (!uploadedMedia) return;

      if (kind === "video") {
        setExerciseVideoMedia(uploadedMedia);
      } else {
        setExerciseThumbnailMedia(uploadedMedia);
      }
    };
    input.click();
  };

  const handleCreateExercise = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (
      !exerciseForm.name.trim() ||
      !exerciseForm.sid.trim() ||
      !exerciseForm.dlid.trim()
    ) {
      alert("Bitte Name, SID und DLID ausfuellen.");
      return;
    }

    if (!exerciseVideoMedia || !exerciseThumbnailMedia) {
      alert("Bitte Video und Thumbnail hochladen.");
      return;
    }

    setIsCreatingExercise(true);
    try {
      const response = await fetch(`${API_BASE_URL}/trainers/exercises`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: exerciseForm.name.trim(),
          description: exerciseForm.description.trim() || undefined,
          video_mid: Number(exerciseVideoMedia.mid),
          thumbnail_mid: Number(exerciseThumbnailMedia.mid),
          sid: exerciseForm.sid.trim(),
          dlid: exerciseForm.dlid.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Uebung konnte nicht erstellt werden.",
        );
      }

      await fetchExercises(token);
      setActiveModal(null);
      resetExerciseForm();
    } catch (error) {
      console.error("Uebung konnte nicht erstellt werden:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Uebung konnte nicht erstellt werden.",
      );
    } finally {
      setIsCreatingExercise(false);
    }
  };

  const refreshTrainerRequests = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    await fetchTrainerRequests(token);
  };

  const handleTrainerRequestAction = async (
    requestId: string,
    action: "accept" | "reject",
    requestUid?: string,
  ) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setProcessingRequestId(requestId);
    try {
      if (action === "accept" && requestUid) {
        const connectResponse = await fetch(
          `${API_BASE_URL}/trainers/connect`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uid: requestUid }),
          },
        );

        const connectData = await connectResponse.json();

        if (!connectResponse.ok) {
          throw new Error(
            connectData?.error ||
              connectData?.message ||
              "Athlet konnte nicht verbunden werden.",
          );
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/trainers/requests/${requestId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Request konnte nicht aktualisiert werden.",
        );
      }

      await fetchTrainerRequests(token);
      await fetchConnectedAthletes(token);
    } catch (error) {
      console.error("Request konnte nicht aktualisiert werden:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Request konnte nicht aktualisiert werden.",
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const filteredRequests = trainerRequests.filter((request) =>
    requestFilter === "all" ? true : request.status === requestFilter,
  );
  const pendingRequestCount = trainerRequests.filter(
    (request) => request.status === "pending",
  ).length;

  const confirmKick = async () => {
    if (!selectedAthlete) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/trainers/disconnect`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: selectedAthlete.uid }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Athlet konnte nicht getrennt werden.",
        );
      }

      await fetchConnectedAthletes(token);
      setActiveModal(null);
      setSelectedAthlete(null);
    } catch (error) {
      console.error("Athlet konnte nicht getrennt werden:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Athlet konnte nicht getrennt werden.",
      );
    }
  };

  const pickFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/webm,video/avi";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) setSelectedFile(target.files[0]);
    };
    input.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Wähle ein Video aus!");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await fetch(`${API_BASE_URL}/media`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });
    } catch {
      /* continue */
    } finally {
      setVideos([
        { id: Math.random().toString(), name: selectedFile.name },
        ...videos,
      ]);
      setIsUploading(false);
      setSelectedFile(null);
      setActiveModal(null);
    }
  };

  const toggleAthleteSelection = (uid: string) => {
    setSelectedAthleteIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    );
  };

  const filteredAthletes = athleteList.filter(
    (a) =>
      a.firstname.toLowerCase().includes(athleteSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(athleteSearch.toLowerCase()),
  );

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Übersicht", icon: LayoutDashboard },
    { id: "athletes", label: "Athleten", icon: Users },
    { id: "exercises", label: "Übungen", icon: Dumbbell },
    { id: "requests", label: "Anfragen", icon: LayoutDashboard },
    { id: "videos", label: "Videos", icon: Film },
  ];

  if (isLoading) {
    return (
      <div className="bg-[#f8fafc] dark:bg-[#0F172A] min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] dark:bg-[#0F172A] min-h-screen flex flex-col">
      {/* Dashboard Topbar */}
      <div className="bg-white dark:bg-[#1E293B] border-b border-slate-100 dark:border-slate-700 h-14 flex items-center justify-between px-5 md:px-8 sticky top-16 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F97316]/10 flex items-center justify-center">
            <Dumbbell size={14} className="text-[#F97316]" />
          </div>
          <span className="text-sm font-semibold text-[#1E3A8A] dark:text-white">
            Trainer Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700">
            <span className="text-xs font-semibold text-[#64748b] dark:text-[#94A3B8]">
              Trainer-Code:
            </span>
            <span className="text-xs font-bold text-[#1E3A8A] dark:text-white tracking-wide">
              {trainerCode}
            </span>
            <button
              onClick={handleCopyTrainerCode}
              className="p-1 rounded-md bg-transparent hover:bg-slate-200 dark:hover:bg-slate-600 border-0 cursor-pointer transition-colors"
              title={copiedTrainerCode ? "Kopiert" : "Trainer-Code kopieren"}
              disabled={trainerCode === "-"}
            >
              <span className="relative block w-3.25 h-3.25">
                <Copy
                  size={13}
                  className={`absolute inset-0 transition-all duration-200 ${copiedTrainerCode ? "opacity-0 scale-75 -rotate-12" : "opacity-100 scale-100 rotate-0 text-[#64748b] dark:text-slate-400"}`}
                />
                <Check
                  size={13}
                  className={`absolute inset-0 text-emerald-500 transition-all duration-200 ${copiedTrainerCode ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 rotate-12"}`}
                  strokeWidth={3}
                />
              </span>
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border-0 cursor-pointer text-[#64748b] dark:text-slate-400 transition-colors"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 font-semibold text-xs px-3 py-2 rounded-lg border-0 cursor-pointer transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-[#1E293B] border-b border-slate-100 dark:border-slate-700 sticky top-30 z-40">
        <div className="max-w-275 mx-auto px-5 md:px-10 flex flex-wrap gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-0 cursor-pointer transition-colors whitespace-nowrap border-b-2 -mb-px bg-transparent ${
                activeTab === id
                  ? "text-[#F97316] border-[#F97316]"
                  : "text-[#64748b] dark:text-[#94A3B8] border-transparent hover:text-[#1E3A8A] dark:hover:text-white"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-275 mx-auto w-full px-5 md:px-10 py-8 flex flex-col gap-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A8A] dark:text-white mb-1">
                Willkommen zurück
              </h1>
              <p className="text-sm text-[#64748b] dark:text-[#94A3B8]">
                Hier ist eine Übersicht über dein Team und deine Inhalte.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  icon: Users,
                  value: athleteList.length,
                  label: "Athleten",
                  tab: "athletes" as Tab,
                  color: "text-[#1E3A8A] dark:text-blue-400",
                  bg: "bg-blue-50 dark:bg-blue-500/10",
                },
                {
                  icon: Dumbbell,
                  value: exercises.length,
                  label: "Übungen",
                  tab: "exercises" as Tab,
                  color: "text-[#F97316]",
                  bg: "bg-[#F97316]/10",
                },
                {
                  icon: Users,
                  value: pendingRequestCount,
                  label: "Anfragen",
                  tab: "requests" as Tab,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-500/10",
                },
                {
                  icon: Film,
                  value: videos.length,
                  label: "Videos",
                  tab: "videos" as Tab,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-500/10",
                },
              ].map(({ icon: Icon, value, label, tab, color, bg }) => (
                <button
                  key={label}
                  onClick={() => {
                    if (tab === "requests") {
                      openRequestsTab();
                      return;
                    }

                    setActiveTab(tab);
                  }}
                  className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex items-center justify-between gap-4 text-left hover:border-slate-200 dark:hover:border-slate-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon size={16} className={color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#64748b] dark:text-[#94A3B8] uppercase tracking-wider">
                        {label}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#1E3A8A] dark:text-white shrink-0">
                    {value}
                  </p>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-xs font-semibold text-[#64748b] dark:text-[#94A3B8] uppercase tracking-wider mb-3">
                Schnellzugriff
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-4 text-left hover:border-[#F97316]/30 dark:hover:border-[#F97316]/30 transition-colors cursor-pointer group"
                  onClick={openCreateExerciseModal}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center shrink-0">
                    <Dumbbell size={18} className="text-[#F97316]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1E3A8A] dark:text-white">
                      Uebung erstellen
                    </p>
                    <p className="text-xs text-[#64748b] dark:text-[#94A3B8]">
                      Neue Uebungen direkt im Dashboard anlegen
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-400 group-hover:text-[#F97316] transition-colors"
                  />
                </button>
                <button
                  className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-4 text-left hover:border-[#F97316]/30 dark:hover:border-[#F97316]/30 transition-colors cursor-pointer group"
                  onClick={openPendingRequestsTab}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Users
                      size={18}
                      className="text-[#1E3A8A] dark:text-blue-400"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1E3A8A] dark:text-white">
                      Anfragen pruefen
                    </p>
                    <p className="text-xs text-[#64748b] dark:text-[#94A3B8]">
                      {pendingRequestCount} offene Requests
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-400 group-hover:text-[#F97316] transition-colors"
                  />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#64748b] dark:text-[#94A3B8] uppercase tracking-wider mb-3">
                Invite Code
              </p>
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-[#64748b] dark:text-[#94A3B8]">
                      Teile diesen Code mit neuen Athleten.
                    </p>
                  </div>
                  <button
                    onClick={handleRegenerateTrainerCode}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border-0 cursor-pointer transition-colors shrink-0"
                    title="Code neu generieren"
                    disabled={trainerCode === "-"}
                  >
                    <RefreshCw
                      size={14}
                      className="text-[#64748b] dark:text-slate-400"
                    />
                  </button>
                </div>
                <div className="rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 px-4 py-3">
                  <p className="text-xs text-[#F97316] font-semibold mb-1">
                    Dein Code
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-xl sm:text-2xl font-bold tracking-[0.2em] text-[#1E3A8A] dark:text-white break-all">
                      {trainerCode}
                    </p>
                    <button
                      onClick={handleCopyTrainerCode}
                      className="p-2 rounded-lg bg-white/70 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 border-0 cursor-pointer transition-colors shrink-0"
                      title={
                        copiedTrainerCode ? "Kopiert" : "Trainer-Code kopieren"
                      }
                      disabled={trainerCode === "-"}
                    >
                      <span className="relative block w-3.5 h-3.5">
                        <Copy
                          size={14}
                          className={`absolute inset-0 transition-all duration-200 ${copiedTrainerCode ? "opacity-0 scale-75 -rotate-12" : "opacity-100 scale-100 rotate-0 text-[#64748b] dark:text-slate-400"}`}
                        />
                        <Check
                          size={14}
                          className={`absolute inset-0 text-emerald-500 transition-all duration-200 ${copiedTrainerCode ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 rotate-12"}`}
                          strokeWidth={3}
                        />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Athletes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#64748b] dark:text-[#94A3B8] uppercase tracking-wider">
                  Athleten
                </p>
                <button
                  className="text-xs text-[#F97316] font-semibold bg-transparent border-0 cursor-pointer hover:underline"
                  onClick={() => setActiveTab("athletes")}
                >
                  Alle anzeigen
                </button>
              </div>
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                {athleteList.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users
                      size={28}
                      className="text-slate-300 dark:text-slate-600 mx-auto mb-2"
                    />
                    <p className="text-sm text-[#64748b] dark:text-[#94A3B8]">
                      Noch keine Athleten verbunden
                    </p>
                  </div>
                ) : (
                  athleteList.slice(0, 3).map((athlete, i) => {
                    const { level, name } = getLevel(athlete.email);
                    return (
                      <div
                        key={athlete.uid}
                        className={`flex items-center gap-4 px-5 py-3.5 ${i !== Math.min(2, athleteList.length - 1) ? "border-b border-slate-100 dark:border-slate-700" : ""}`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#F97316] flex items-center justify-center shrink-0">
                          <span className="text-white text-sm font-bold">
                            {athlete.firstname[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1E3A8A] dark:text-white">
                            {athlete.firstname} {name}
                          </p>
                          {level && (
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[level] ?? "bg-slate-100 dark:bg-slate-700 text-[#64748b]"}`}
                            >
                              {level}
                            </span>
                          )}
                        </div>
                        <button
                          className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg border-0 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedAthlete(athlete);
                            setActiveModal("exercise");
                          }}
                          title="Übung zuweisen"
                        >
                          <Plus
                            size={14}
                            className="text-[#1E3A8A] dark:text-white"
                          />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* ATHLETES TAB */}
        {activeTab === "athletes" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-white">
                  Verbundene Athleten
                </h2>
                <p className="text-sm text-[#64748b] dark:text-[#94A3B8] mt-0.5">
                  {athleteList.length} Athleten mit dir verbunden
                </p>
              </div>
            </div>

            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Athleten suchen…"
                value={athleteSearch}
                onChange={(e) => setAthleteSearch(e.target.value)}
                className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1E3A8A] dark:text-white placeholder:text-slate-400 outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-colors"
              />
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              {filteredAthletes.length === 0 ? (
                <div className="py-12 text-center">
                  <Users
                    size={28}
                    className="text-slate-300 dark:text-slate-600 mx-auto mb-2"
                  />
                  <p className="text-sm text-[#64748b] dark:text-[#94A3B8]">
                    Keine verbundenen Athleten gefunden
                  </p>
                </div>
              ) : (
                filteredAthletes.map((athlete, i) => {
                  const { level, name } = getLevel(athlete.email);
                  return (
                    <div
                      key={athlete.uid}
                      className={`flex items-center gap-4 px-5 py-4 ${i !== filteredAthletes.length - 1 ? "border-b border-slate-100 dark:border-slate-700" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center shrink-0">
                        <span className="text-white text-sm font-bold">
                          {athlete.firstname[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1E3A8A] dark:text-white">
                          {athlete.firstname} {name}
                        </p>
                        {level && (
                          <span
                            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${LEVEL_COLORS[level] ?? "bg-slate-100 dark:bg-slate-700 text-[#64748b]"}`}
                          >
                            {level}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-[#1E3A8A] dark:text-white text-xs font-semibold px-3 py-2 rounded-lg border-0 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedAthlete(athlete);
                            setActiveModal("exercise");
                          }}
                        >
                          <Plus size={13} />
                          <span className="hidden sm:inline">Übung</span>
                        </button>
                        <button
                          className="p-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg border-0 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedAthlete(athlete);
                            setActiveModal("kick");
                          }}
                          title="Athlet trennen"
                        >
                          <UserMinus size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* EXERCISES TAB */}
        {activeTab === "exercises" && (
          <>
            <div>
              <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-white">
                Übungen
              </h2>
              <p className="text-sm text-[#64748b] dark:text-[#94A3B8] mt-0.5">
                {exercises.length} Übungen verfügbar
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[#64748b] dark:text-[#94A3B8] uppercase tracking-wider">
                Neue Uebungen
              </p>
              <button className={primaryBtn} onClick={openCreateExerciseModal}>
                <Plus size={14} />
                <span className="hidden sm:inline">Erstellen</span>
              </button>
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              {exercises.length === 0 ? (
                <div className="py-12 text-center">
                  <Dumbbell
                    size={28}
                    className="text-slate-300 dark:text-slate-600 mx-auto mb-2"
                  />
                  <p className="text-sm text-[#64748b] dark:text-[#94A3B8]">
                    Keine Übungen gefunden
                  </p>
                </div>
              ) : (
                exercises.map((exercise, i) => (
                  <div
                    key={exercise.eid}
                    className={`flex items-center gap-4 px-5 py-4 ${i !== exercises.length - 1 ? "border-b border-slate-100 dark:border-slate-700" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#F97316]/10 flex items-center justify-center shrink-0">
                      <Zap size={15} className="text-[#F97316]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1E3A8A] dark:text-white">
                        {exercise.name}
                      </p>
                      {exercise.duration_minutes && (
                        <p className="text-xs text-[#64748b] dark:text-[#94A3B8] mt-0.5">
                          {exercise.duration_minutes} Min.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* REQUESTS TAB */}
        {activeTab === "requests" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-white">
                  Anfragen
                </h2>
                <p className="text-sm text-[#64748b] dark:text-[#94A3B8] mt-0.5">
                  {filteredRequests.length} von {trainerRequests.length}{" "}
                  Requests
                </p>
              </div>
              <button className={primaryBtn} onClick={refreshTrainerRequests}>
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Aktualisieren</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "Alle"],
                  ["pending", "Pending"],
                  ["accepted", "Accepted"],
                  ["rejected", "Rejected"],
                ] as const
              ).map(([value, label]) => {
                const requestCount =
                  value === "all"
                    ? trainerRequests.length
                    : trainerRequests.filter(
                        (request) => request.status === value,
                      ).length;

                return (
                  <button
                    key={value}
                    onClick={() => setRequestFilter(value)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${requestFilter === value ? "bg-[#F97316] text-white border-[#F97316]" : "bg-white dark:bg-[#1E293B] text-[#1E3A8A] dark:text-white border-slate-200 dark:border-slate-700 hover:border-[#F97316]/30"}`}
                  >
                    {label}
                    <span className="ml-1 opacity-70">{requestCount}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              {filteredRequests.length === 0 ? (
                <div className="py-12 text-center">
                  <Users
                    size={28}
                    className="text-slate-300 dark:text-slate-600 mx-auto mb-2"
                  />
                  <p className="text-sm text-[#64748b] dark:text-[#94A3B8]">
                    Keine Requests für diesen Filter vorhanden
                  </p>
                </div>
              ) : (
                filteredRequests.map((request, i) => {
                  const statusClass =
                    REQUEST_STATUS_COLORS[request.status] ??
                    "bg-slate-100 dark:bg-slate-700 text-[#64748b]";
                  const requestName = [request.firstname, request.lastname]
                    .filter(Boolean)
                    .join(" ")
                    .trim();

                  return (
                    <div
                      key={request.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i !== filteredRequests.length - 1 ? "border-b border-slate-100 dark:border-slate-700" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-sm font-bold">
                          {request.firstname[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[#1E3A8A] dark:text-white">
                            {requestName || request.email || request.uid}
                          </p>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass}`}
                          >
                            {formatRequestStatus(request.status)}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748b] dark:text-[#94A3B8] mt-0.5">
                          {request.email ? `${request.email} · ` : ""}
                          {new Date(request.created_at).toLocaleDateString(
                            "de-DE",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      {request.status === "pending" && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-3 py-2 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() =>
                              handleTrainerRequestAction(
                                request.id,
                                "accept",
                                request.uid,
                              )
                            }
                            disabled={processingRequestId === request.id}
                          >
                            <Check size={13} />
                            Akzeptieren
                          </button>
                          <button
                            className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold px-3 py-2 rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() =>
                              handleTrainerRequestAction(request.id, "reject")
                            }
                            disabled={processingRequestId === request.id}
                          >
                            <X size={13} />
                            Ablehnen
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* VIDEOS TAB */}
        {activeTab === "videos" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-white">
                  Videos
                </h2>
                <p className="text-sm text-[#64748b] dark:text-[#94A3B8] mt-0.5">
                  {videos.length} Videos in deiner Bibliothek
                </p>
              </div>
              <button
                className={primaryBtn}
                onClick={() => setActiveModal("videoUpload")}
              >
                <Upload size={14} />
                <span className="hidden sm:inline">Hochladen</span>
              </button>
            </div>

            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              {videos.length === 0 ? (
                <div className="py-12 text-center">
                  <Film
                    size={28}
                    className="text-slate-300 dark:text-slate-600 mx-auto mb-2"
                  />
                  <p className="text-sm text-[#64748b] dark:text-[#94A3B8]">
                    Noch keine Videos hochgeladen
                  </p>
                </div>
              ) : (
                videos.map((video, i) => (
                  <button
                    key={video.id}
                    className={`flex items-center gap-4 px-5 py-4 w-full text-left bg-transparent border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${i !== videos.length - 1 ? "border-b border-slate-100 dark:border-slate-700" : ""}`}
                    onClick={() => {
                      setSelectedVideo(video);
                      setSelectedAthleteIds([]);
                      setActiveModal("videoAssign");
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Video
                        size={15}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                    <span className="text-sm font-medium text-[#1E3A8A] dark:text-white flex-1 truncate">
                      {video.name}
                    </span>
                    <ChevronRight
                      size={15}
                      className="text-slate-400 shrink-0"
                    />
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL: Exercise */}
      <Modal
        visible={activeModal === "createExercise"}
        onClose={closeCreateExerciseModal}
      >
        <div className={modalCard}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-bold text-[#1E3A8A] dark:text-white">
                Uebung erstellen
              </p>
              <p className="text-xs text-[#64748b] dark:text-[#94A3B8]">
                Neue Uebung direkt anlegen
              </p>
            </div>
            <button
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 border-0 cursor-pointer"
              onClick={closeCreateExerciseModal}
            >
              <X size={14} className="text-[#64748b] dark:text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1E3A8A] dark:text-slate-300">
                Name *
              </label>
              <input
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1E3A8A] dark:text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all"
                placeholder="z.B. Sprint Technik"
                value={exerciseForm.name}
                onChange={(e) =>
                  setExerciseForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1E3A8A] dark:text-slate-300">
                Beschreibung
              </label>
              <textarea
                className="w-full min-h-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1E3A8A] dark:text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all resize-none"
                placeholder="Kurze Beschreibung der Uebung"
                value={exerciseForm.description}
                onChange={(e) =>
                  setExerciseForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                className="flex flex-col items-start gap-2 w-full bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 hover:border-[#F97316] rounded-xl px-4 py-4 text-left transition-colors"
                onClick={() => pickExerciseMedia("video")}
              >
                <div className="flex items-center gap-2">
                  <Upload size={16} className="text-[#F97316]" />
                  <span className="text-xs font-semibold text-[#1E3A8A] dark:text-slate-300">
                    Video hochladen *
                  </span>
                </div>
                <span className="text-xs text-[#64748b] dark:text-[#94A3B8]">
                  {isUploadingExerciseMedia === "video"
                    ? "Lade hoch..."
                    : exerciseVideoMedia
                      ? exerciseVideoMedia.filename || "Video hochgeladen"
                      : "Datei auswählen und direkt in Media speichern"}
                </span>
              </button>

              <button
                type="button"
                className="flex flex-col items-start gap-2 w-full bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 hover:border-[#F97316] rounded-xl px-4 py-4 text-left transition-colors"
                onClick={() => pickExerciseMedia("thumbnail")}
              >
                <div className="flex items-center gap-2">
                  <Upload size={16} className="text-[#F97316]" />
                  <span className="text-xs font-semibold text-[#1E3A8A] dark:text-slate-300">
                    Thumbnail hochladen
                  </span>
                </div>
                <span className="text-xs text-[#64748b] dark:text-[#94A3B8]">
                  {isUploadingExerciseMedia === "thumbnail"
                    ? "Lade hoch..."
                    : exerciseThumbnailMedia
                      ? exerciseThumbnailMedia.filename ||
                        "Thumbnail hochgeladen"
                      : "Optional: Bild auswählen und hochladen"}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-[#1E3A8A] dark:text-slate-300">
                    SID - Sport ID *
                  </label>
                  <button
                    type="button"
                    className="p-0.5 rounded-full text-slate-400 hover:text-[#F97316] transition-colors cursor-help"
                    title="SID = Sport ID | 1 = gym, 2 = basketball"
                    aria-label="Sport ID Hilfe"
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>
                <input
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1E3A8A] dark:text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all"
                  placeholder="z.B. 1"
                  value={exerciseForm.sid}
                  onChange={(e) =>
                    setExerciseForm((prev) => ({
                      ...prev,
                      sid: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-[#1E3A8A] dark:text-slate-300">
                    DLID - Difficulty Level ID *
                  </label>
                  <button
                    type="button"
                    className="p-0.5 rounded-full text-slate-400 hover:text-[#F97316] transition-colors cursor-help"
                    title="DLID = Difficulty Level ID | 1 = beginner, 2 = intermediate, 3 = advanced, 4 = expert"
                    aria-label="Difficulty Level ID Hilfe"
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>
                <input
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1E3A8A] dark:text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all"
                  placeholder="z.B. 1"
                  value={exerciseForm.dlid}
                  onChange={(e) =>
                    setExerciseForm((prev) => ({
                      ...prev,
                      dlid: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              className={`${ghostBtn} flex-1`}
              onClick={closeCreateExerciseModal}
            >
              Abbrechen
            </button>
            <button
              className={`${primaryBtn} flex-1 ${isCreatingExercise ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={handleCreateExercise}
              disabled={isCreatingExercise}
            >
              {isCreatingExercise ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-[spin_0.8s_linear_infinite]" />
              ) : (
                "Erstellen"
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        visible={activeModal === "exercise"}
        onClose={() => setActiveModal(null)}
      >
        <div className={modalCard}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-bold text-[#1E3A8A] dark:text-white">
                Übung zuweisen
              </p>
              <p className="text-xs text-[#64748b] dark:text-[#94A3B8]">
                für {selectedAthlete?.firstname}
              </p>
            </div>
            <button
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 border-0 cursor-pointer"
              onClick={() => setActiveModal(null)}
            >
              <X size={14} className="text-[#64748b] dark:text-slate-400" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
            {exercises.length === 0 ? (
              <p className="text-sm text-[#64748b] dark:text-[#94A3B8] py-4 text-center">
                Keine Übungen gefunden.
              </p>
            ) : (
              exercises.map((exercise) => (
                <button
                  key={exercise.eid}
                  className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl p-3 border border-slate-100 dark:border-slate-700 cursor-pointer text-left w-full transition-colors"
                  onClick={() => {
                    alert("Übung zugewiesen!");
                    setActiveModal(null);
                  }}
                >
                  <Zap size={14} className="text-[#F97316] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#1E3A8A] dark:text-white">
                      {exercise.name}
                    </p>
                    <p className="text-xs text-[#64748b] dark:text-[#94A3B8]">
                      {exercise.duration_minutes
                        ? `${exercise.duration_minutes} Min.`
                        : "Tippen zum Auswählen"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
          <button
            className={`${ghostBtn} w-full mt-4`}
            onClick={() => setActiveModal(null)}
          >
            Abbrechen
          </button>
        </div>
      </Modal>

      {/* MODAL: Video Upload */}
      <Modal
        visible={activeModal === "videoUpload"}
        onClose={() => setActiveModal(null)}
      >
        <div className={modalCard}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-base font-bold text-[#1E3A8A] dark:text-white">
              Video hochladen
            </p>
            <button
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 border-0 cursor-pointer"
              onClick={() => setActiveModal(null)}
            >
              <X size={14} className="text-[#64748b] dark:text-slate-400" />
            </button>
          </div>
          <button
            className="w-full border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-[#F97316] dark:hover:border-[#F97316] rounded-xl p-8 cursor-pointer bg-transparent transition-colors flex flex-col items-center gap-2"
            onClick={pickFile}
          >
            <Upload
              size={22}
              className={selectedFile ? "text-[#F97316]" : "text-slate-400"}
            />
            <span className="text-sm font-medium text-[#64748b] dark:text-[#94A3B8]">
              {selectedFile ? selectedFile.name : "Datei auswählen (MP4, AVI…)"}
            </span>
          </button>
          <div className="flex gap-3 mt-4">
            <button
              className={`${ghostBtn} flex-1`}
              onClick={() => setActiveModal(null)}
            >
              Abbrechen
            </button>
            <button
              className={`${primaryBtn} flex-1 ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-[spin_0.8s_linear_infinite]" />
              ) : (
                "Hochladen"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Video Assign */}
      <Modal
        visible={activeModal === "videoAssign"}
        onClose={() => setActiveModal(null)}
      >
        <div className={modalCard}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-base font-bold text-[#1E3A8A] dark:text-white">
              Video verteilen
            </p>
            <button
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 border-0 cursor-pointer"
              onClick={() => setActiveModal(null)}
            >
              <X size={14} className="text-[#64748b] dark:text-slate-400" />
            </button>
          </div>
          <p className="text-xs text-[#F97316] font-medium mb-4 truncate">
            {selectedVideo?.name}
          </p>
          <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
            {athleteList.map((athlete) => {
              const isSelected = selectedAthleteIds.includes(athlete.uid);
              return (
                <button
                  key={athlete.uid}
                  className={`flex items-center gap-3 rounded-xl p-3 border cursor-pointer text-left w-full transition-colors ${isSelected ? "bg-[#F97316]/10 border-[#F97316]/30" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                  onClick={() => toggleAthleteSelection(athlete.uid)}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-[#F97316] border-[#F97316]" : "border-slate-300 dark:border-slate-600"}`}
                  >
                    {isSelected && (
                      <Check size={11} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {athlete.firstname[0]}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${isSelected ? "text-[#F97316]" : "text-[#1E3A8A] dark:text-white"}`}
                  >
                    {athlete.firstname}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              className={`${ghostBtn} flex-1`}
              onClick={() => setActiveModal(null)}
            >
              Abbrechen
            </button>
            <button
              className={`${primaryBtn} flex-1`}
              onClick={() => {
                if (selectedAthleteIds.length === 0)
                  return alert("Bitte Athleten auswählen!");
                alert("Video gesendet!");
                setSelectedAthleteIds([]);
                setActiveModal(null);
              }}
            >
              Senden
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Kick */}
      <Modal
        visible={activeModal === "kick"}
        onClose={() => setActiveModal(null)}
      >
        <div className={modalCard}>
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
            <UserMinus size={20} className="text-red-500" />
          </div>
          <p className="text-base font-bold text-[#1E3A8A] dark:text-white mb-1">
            Athlet trennen
          </p>
          <p className="text-sm text-[#64748b] dark:text-[#94A3B8] mb-6">
            Bist du sicher, dass du{" "}
            <span className="font-semibold text-[#1E3A8A] dark:text-white">
              {selectedAthlete?.firstname}
            </span>{" "}
            von dir trennen möchtest?
          </p>
          <div className="flex gap-3">
            <button
              className={`${ghostBtn} flex-1`}
              onClick={() => setActiveModal(null)}
            >
              Abbrechen
            </button>
            <button
              className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-xl border-0 cursor-pointer transition-colors text-sm"
              onClick={confirmKick}
            >
              Ja, trennen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
