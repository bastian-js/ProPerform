import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X, RotateCw } from "lucide-react";
import Button from "../components/Button";
import Heading from "../components/Heading";
import Text from "../components/Text";
import { apiFetch } from "../helpers/apiFetch";

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
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [, setErr] = useState<string | null>(null);
  const stateTimeoutRef = useRef<number | null>(null);

  const fetchHealth = useCallback(async () => {
    setButtonState((current) => {
      if (current === "loading") return current;
      return current;
    });

    if (stateTimeoutRef.current) {
      clearTimeout(stateTimeoutRef.current);
      stateTimeoutRef.current = null;
    }

    setButtonState("loading");

    try {
      const res = await apiFetch(
        "https://api.properform.app/system/healthcheck",
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Status ${res.status}: ${txt}`);
      }

      const data = await res.json();
      setHealth(data);
      setErr(null);
      setButtonState("success");

      stateTimeoutRef.current = window.setTimeout(() => {
        setButtonState("idle");
        stateTimeoutRef.current = null;
      }, 5000);
    } catch (e: any) {
      setErr(e.message || "Error loading system status");
      setHealth(null);
      setButtonState("error");

      stateTimeoutRef.current = window.setTimeout(() => {
        setButtonState("idle");
        stateTimeoutRef.current = null;
      }, 5000);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    return () => {
      if (stateTimeoutRef.current) {
        clearTimeout(stateTimeoutRef.current);
      }
    };
  }, []);

  const percentToBar = (p?: string) =>
    p ? Math.min(100, Math.max(0, Math.round(Number(p)))) : 0;

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Heading>System Status</Heading>
      </div>

      {/* Control Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="text-gray-400">Last Check</span>
          <span className="text-gray-300 font-medium ml-2">
            {health?.timestamp
              ? new Date(health.timestamp).toLocaleString("en-US")
              : "—"}
          </span>
        </div>

        <Button
          onClick={fetchHealth}
          variant={
            buttonState === "error"
              ? "danger"
              : buttonState === "success"
                ? "success"
                : "primary"
          }
          disabled={buttonState === "loading"}
          icon={
            buttonState === "loading"
              ? RotateCw
              : buttonState === "success"
                ? Check
                : buttonState === "error"
                  ? X
                  : undefined
          }
          className="flex items-center gap-2 whitespace-nowrap h-12"
        >
          {buttonState === "idle" && "Refresh"}
          {buttonState === "loading" && "Loading..."}
          {buttonState === "success" && "Loaded"}
          {buttonState === "error" && "Error"}
        </Button>
      </div>

      {/* System Data Display */}
      {health && buttonState !== "loading" && (
        <div className="animate-slideUp">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-100">
              System Information
            </h3>

            {/* API Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  API Status
                </p>
                <p className="text-lg font-semibold text-gray-100 mb-2">
                  {health.status === "ok" ? "Operational" : "Offline"}
                </p>
                <div
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${
                    health.status === "ok"
                      ? "bg-green-950 text-green-300 border border-green-800"
                      : "bg-red-950 text-red-300 border border-red-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${health.status === "ok" ? "bg-green-400" : "bg-red-400"}`}
                  />
                  {health.status === "ok" ? "Online" : "Offline"}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Response Time
                </p>
                <p className="text-lg font-semibold text-blue-400">
                  {health.response_time_ms
                    ? `${health.response_time_ms}ms`
                    : "—"}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 md:col-span-2">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Database
                </p>
                <p className="text-lg font-semibold text-gray-100">
                  {health.database ?? "—"}
                </p>
              </div>
            </div>

            {/* Node Process */}
            <div>
              <h4 className="text-base font-semibold text-gray-100 mb-3">
                Node Process
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 font-medium mb-1">
                    Process ID
                  </p>
                  <p className="text-lg font-semibold text-gray-100">
                    {health.process?.pid ?? "—"}
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 font-medium mb-1">
                    Memory Usage
                  </p>
                  <p className="text-lg font-semibold text-gray-100">
                    {health.process?.memory_mb ?? "—"}
                    <span className="text-sm text-gray-400 ml-1">MB</span>
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 font-medium mb-1">
                    Uptime
                  </p>
                  <p className="text-lg font-semibold text-gray-100">
                    {health.process?.uptime_s
                      ? `${Math.floor(health.process.uptime_s / 3600)}h ${Math.floor((health.process.uptime_s % 3600) / 60)}m`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div>
              <h4 className="text-base font-semibold text-gray-100 mb-3">
                System Info
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 font-medium mb-1">
                    Hostname
                  </p>
                  <p className="text-sm text-gray-300">
                    {health.system?.hostname ?? "—"}
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 font-medium mb-1">
                    Platform
                  </p>
                  <p className="text-sm text-gray-300">
                    {health.system?.platform ?? "—"} {health.system?.arch ?? ""}
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 font-medium mb-1">
                    CPU Cores
                  </p>
                  <p className="text-lg font-semibold text-gray-100">
                    {health.system?.cpu_cores ?? "—"}
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 font-medium mb-1">
                    CPU Load
                  </p>
                  <p className="text-sm text-gray-300">
                    {health.system?.cpu_load ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Memory */}
            <div>
              <h4 className="text-base font-semibold text-gray-100 mb-3">
                Memory Usage
              </h4>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-baseline mb-3">
                  <p className="text-sm text-gray-400 font-medium">Used</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {health.system?.memory?.used_percent ?? "—"}%
                  </p>
                </div>

                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentToBar(health.system?.memory?.used_percent)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="text-gray-300 font-medium">
                    {health.system?.memory?.total_gb ?? "—"}
                    <span className="text-gray-400 text-xs ml-1">GB</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mt-8">
        <Heading>Notes</Heading>
        <Text>
          Click "Refresh" to check the current system status. The page loads the
          system status automatically when you first visit.
        </Text>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
