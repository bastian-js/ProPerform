import { AlertCircle, CheckCircle, InfoIcon, XCircle } from "lucide-react";

type AlertType = "info" | "success" | "error" | "warning";

type AlertProps = {
  open: boolean;
  title: string;
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function Alert({
  open,
  title,
  message,
  type = "info",
  onConfirm,
  onCancel,
}: AlertProps) {
  if (!open) return null;

  const config: Record<
    AlertType,
    { colors: string; icon: React.ReactNode; gradient: string }
  > = {
    info: {
      colors: "border-blue-400 bg-gray-800",
      icon: <InfoIcon className="w-6 h-6 text-blue-400" />,
      gradient: "bg-blue-600 hover:bg-blue-700",
    },
    success: {
      colors: "border-green-400 bg-gray-800",
      icon: <CheckCircle className="w-6 h-6 text-green-400" />,
      gradient: "bg-green-600 hover:bg-green-700",
    },
    error: {
      colors: "border-red-400 bg-gray-800",
      icon: <XCircle className="w-6 h-6 text-red-400" />,
      gradient: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      colors: "border-orange-400 bg-gray-800",
      icon: <AlertCircle className="w-6 h-6 text-orange-400" />,
      gradient: "bg-orange-600 hover:bg-orange-700",
    },
  };

  const current = config[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`border-2 ${current.colors} text-white rounded-2xl shadow-2xl w-[90%] max-w-md p-8 transform transition-all`}
      >
        {/* Header mit Icon */}
        <div className="flex items-start gap-4 mb-1">
          <div className="flex-shrink-0 mt-1">{current.icon}</div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-200 mb-4 leading-relaxed ml-10">{message}</p>

        {/* Buttons */}
        <div className="flex justify-end gap-3 ml-10">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200 font-semibold cursor-pointer border border-gray-600 hover:border-gray-500"
            >
              Abbrechen
            </button>
          )}

          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-6 py-3 rounded-lg text-white font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${current.gradient}`}
            >
              Bestätigen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
