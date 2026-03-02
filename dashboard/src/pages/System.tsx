import { useEffect, useState } from "react";
import { Check, X, RotateCw } from "lucide-react";

type Health = {
  status: string;
  response_time_ms?: number;
  timestamp?: string;
  database?: string;
  system?: {
    platform?: string;
    arch?: string;
    hostname?: string;
    uptime_s?: number;
    cpu_cores?: number;
    cpu_load?: string;
    memory?: { total_gb?: string; used_percent?: string };
  };
  process?: { pid?: number; memory_mb?: string; uptime_s?: number };
  error?: string;
};

type ButtonState = "idle" | "loading" | "success" | "error";

export default function SystemStatus() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const fetchHealth = async () => {
    setLoading(true);
    setButtonState("loading");
    setErr(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const res = await fetch("https://api.properform.app/system/healthcheck", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Status ${res.status}: ${txt}`);
      }

      const data = await res.json();
      setHealth(data);
      setButtonState("success");

      // Reset button nach 2s
      setTimeout(() => setButtonState("idle"), 2000);
    } catch (e: any) {
      setErr(e.message || "Fehler beim Laden");
      setHealth(null);
      setButtonState("error");

      // Reset button nach 2s
      setTimeout(() => setButtonState("idle"), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 10000);
    return () => clearInterval(id);
  }, []);

  const percentToBar = (p?: string) =>
    p ? Math.min(100, Math.max(0, Math.round(Number(p)))) : 0;

  const getButtonColor = () => {
    if (buttonState === "success") return "from-emerald-500 to-teal-500";
    if (buttonState === "error") return "from-red-500 to-rose-500";
    return "from-blue-500 to-cyan-500";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-32 right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        .status-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%);
          border: 1px solid rgba(148, 163, 184, 0.1);
          backdrop-filter: blur(20px);
        }

        .button-icon {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .button-loading {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(203, 213, 225, 0.8);
          white-space: nowrap;
        }

        .status-badge.ok {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .status-badge.error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .stat-value {
          font-weight: 600;
          color: #e2e8f0;
          font-variant-numeric: tabular-nums;
        }

        .stat-label {
          color: rgba(203, 213, 225, 0.6);
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .memory-bar {
          height: 6px;
          background: rgba(148, 163, 184, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin: 10px 0;
        }

        .memory-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%);
          border-radius: 3px;
          transition: width 0.5s ease-out;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }

        .error-box {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fca5a5;
          font-size: 14px;
          margin-top: 16px;
          animation: slideUp 0.4s ease-out;
        }

        .grid-item {
          animation: slideUp 0.6s ease-out backwards;
        }

        .grid-item:nth-child(1) { animation-delay: 0.05s; }
        .grid-item:nth-child(2) { animation-delay: 0.1s; }
        .grid-item:nth-child(3) { animation-delay: 0.15s; }
        .grid-item:nth-child(4) { animation-delay: 0.2s; }
      `}</style>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 mb-2">
            System Status
          </h1>
        </div>

        {/* Control Bar */}
        <div className="flex justify-between items-center mb-8 px-1">
          <div className="text-sm">
            <span className="text-slate-400">Letzte Abfrage</span>
            <span className="text-slate-300 font-medium ml-2">
              {health?.timestamp
                ? new Date(health.timestamp).toLocaleString("de-DE")
                : "—"}
            </span>
          </div>

          <button
            onClick={fetchHealth}
            disabled={buttonState === "loading"}
            className={`relative group px-5 py-3 rounded-full font-semibold text-white transition-all duration-300 overflow-hidden disabled:cursor-not-allowed cursor-pointer
              bg-gradient-to-r ${getButtonColor()}
              shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95
            `}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {buttonState === "loading" && (
              <RotateCw className="button-icon button-loading w-5 h-5" />
            )}

            {buttonState === "success" && (
              <Check className="button-icon animate-scale-in w-5 h-5" />
            )}

            {buttonState === "error" && (
              <X className="button-icon animate-scale-in w-5 h-5" />
            )}

            {buttonState === "idle" && (
              <RotateCw className="button-icon w-5 h-5" />
            )}
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* API Status Card */}
          <div className="status-card grid-item rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="stat-label mb-1">API Status</div>
                <div className="text-2xl font-black text-slate-200">
                  {health?.status === "ok"
                    ? "Operational"
                    : health?.status === "error"
                      ? "Offline"
                      : "Unknown"}
                </div>
              </div>

              <div
                className={`status-badge ${health?.status === "ok" ? "ok" : health?.status === "error" ? "error" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${health?.status === "ok" ? "bg-emerald-500" : health?.status === "error" ? "bg-red-500" : "bg-slate-500"}`}
                />
                {health?.status === "ok"
                  ? "Online"
                  : health?.status === "error"
                    ? "Error"
                    : "Unknown"}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="stat-label">Response Time</div>
                <div className="stat-value text-lg">
                  {health?.response_time_ms
                    ? `${health.response_time_ms}ms`
                    : "—"}
                </div>
              </div>

              <div>
                <div className="stat-label">Database</div>
                <div className="stat-value">{health?.database ?? "—"}</div>
              </div>
            </div>
          </div>

          {/* Node Process Card */}
          <div className="status-card grid-item rounded-2xl p-6">
            <div className="stat-label mb-6">Node Process</div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 text-sm">Process ID</span>
                <span className="stat-value">
                  {health?.process?.pid ?? "—"}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 text-sm">Memory Usage</span>
                <span className="stat-value">
                  {health?.process?.memory_mb ?? "—"}
                  <span className="text-slate-500 text-sm ml-1">MB</span>
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 text-sm">Uptime</span>
                <span className="stat-value">
                  {health?.process?.uptime_s
                    ? `${Math.floor(health.process.uptime_s / 3600)}h ${Math.floor((health.process.uptime_s % 3600) / 60)}m`
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* System Info Card */}
          <div className="status-card grid-item rounded-2xl p-6">
            <div className="stat-label mb-6">System Info</div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 text-sm">Hostname</span>
                <span className="stat-value text-sm">
                  {health?.system?.hostname ?? "—"}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 text-sm">Platform</span>
                <span className="stat-value text-sm">
                  {health?.system?.platform ?? "—"} {health?.system?.arch ?? ""}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 text-sm">CPU Cores</span>
                <span className="stat-value">
                  {health?.system?.cpu_cores ?? "—"}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 text-sm">CPU Load</span>
                <span className="stat-value text-sm">
                  {health?.system?.cpu_load ?? "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Card */}
          <div className="status-card grid-item rounded-2xl p-6">
            <div className="flex items-baseline justify-between mb-2">
              <div className="stat-label">Memory Usage</div>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {health?.system?.memory?.used_percent ?? "—"}%
              </span>
            </div>

            <div className="memory-bar">
              <div
                className="memory-fill"
                style={{
                  width: `${percentToBar(health?.system?.memory?.used_percent)}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-baseline text-sm pt-2">
              <span className="text-slate-400">Total</span>
              <span className="stat-value">
                {health?.system?.memory?.total_gb ?? "—"}
                <span className="text-slate-500 text-xs ml-1">GB</span>
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {err && (
          <div className="error-box">
            <strong>Fehler:</strong> {err}
          </div>
        )}

        {/* Loading State */}
        {!health && !err && loading && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-slate-400">
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Laden...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
