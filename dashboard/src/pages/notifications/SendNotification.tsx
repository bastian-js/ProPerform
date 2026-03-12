import Heading from "../../components/Heading";
import Text from "../../components/Text";
import Button from "../../components/Button";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, Loader, Send } from "lucide-react";
import { apiFetch } from "../../helpers/apiFetch";

export default function NotificationsDashboard() {
  const BASE_URL = "https://api.properform.app";

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    targetType: "all",
    targetId: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestState, setRequestState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const stateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stateTimeoutRef.current) {
        window.clearTimeout(stateTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendNotification = async () => {
    if (requestState === "loading") return;

    const { title, body, targetType, targetId } = formData;

    // Validation
    if (!title.trim()) {
      setErrorMessage("Title is required.");
      setRequestState("error");
      setSuccessMessage("");

      stateTimeoutRef.current = window.setTimeout(() => {
        setRequestState("idle");
        stateTimeoutRef.current = null;
      }, 5000);
      return;
    }

    if (!body.trim()) {
      setErrorMessage("Body is required.");
      setRequestState("error");
      setSuccessMessage("");

      stateTimeoutRef.current = window.setTimeout(() => {
        setRequestState("idle");
        stateTimeoutRef.current = null;
      }, 5000);
      return;
    }

    if (targetType === "single" && !targetId.trim()) {
      setErrorMessage("Target ID is required for single user notifications.");
      setRequestState("error");
      setSuccessMessage("");

      stateTimeoutRef.current = window.setTimeout(() => {
        setRequestState("idle");
        stateTimeoutRef.current = null;
      }, 5000);
      return;
    }

    if (stateTimeoutRef.current) {
      window.clearTimeout(stateTimeoutRef.current);
      stateTimeoutRef.current = null;
    }

    setRequestState("loading");

    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        targetType,
        targetId: targetType === "single" ? parseInt(targetId) : null,
      };

      const result = await apiFetch(`${BASE_URL}/admin/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (result.ok) {
        setSuccessMessage("Notification sent successfully!");
        setErrorMessage("");
        setRequestState("success");

        // Reset form
        setFormData({
          title: "",
          body: "",
          targetType: "all",
          targetId: "",
        });

        stateTimeoutRef.current = window.setTimeout(() => {
          setRequestState("idle");
          stateTimeoutRef.current = null;
        }, 5000);
      } else {
        const errorData = await result.json().catch(() => ({}));
        setErrorMessage(errorData.message || "Failed to send notification.");
        setSuccessMessage("");
        setRequestState("error");

        stateTimeoutRef.current = window.setTimeout(() => {
          setRequestState("idle");
          stateTimeoutRef.current = null;
        }, 5000);
      }
    } catch (err) {
      setErrorMessage("Error sending notification: Network error.");
      setSuccessMessage("");
      setRequestState("error");

      stateTimeoutRef.current = window.setTimeout(() => {
        setRequestState("idle");
        stateTimeoutRef.current = null;
      }, 5000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.ctrlKey && requestState !== "loading") {
      handleSendNotification();
    }
  };

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Heading>Send Notifications</Heading>
      </div>

      {/* Form Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter notification title..."
            disabled={requestState === "loading"}
            className="w-full px-5 py-3 border border-gray-600 bg-gray-900 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-800 disabled:text-gray-500 placeholder-gray-500 text-base"
          />
        </div>

        {/* Body Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Message Body <span className="text-red-400">*</span>
          </label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            placeholder="Enter notification message..."
            disabled={requestState === "loading"}
            rows={4}
            className="w-full px-5 py-3 border border-gray-600 bg-gray-900 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-800 disabled:text-gray-500 placeholder-gray-500 text-base resize-none"
          />
        </div>

        {/* Target Type Select */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Target Type <span className="text-red-400">*</span>
          </label>
          <select
            name="targetType"
            value={formData.targetType}
            onChange={handleInputChange}
            disabled={requestState === "loading"}
            className="w-full px-5 py-3 border border-gray-600 bg-gray-900 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-800 disabled:text-gray-500 text-base cursor-pointer"
          >
            <option value="all">All Users</option>
            <option value="single">Single User</option>
          </select>
        </div>

        {/* Target ID Input (conditional) */}
        {formData.targetType === "single" && (
          <div className="space-y-2 animate-fadeIn">
            <label className="block text-sm font-medium text-gray-300">
              User ID <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="targetId"
              value={formData.targetId}
              onChange={handleInputChange}
              placeholder="Enter user ID..."
              disabled={requestState === "loading"}
              className="w-full px-5 py-3 border border-gray-600 bg-gray-900 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-800 disabled:text-gray-500 placeholder-gray-500 text-base"
            />
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendNotification}
          variant={
            requestState === "error"
              ? "danger"
              : requestState === "success"
                ? "success"
                : "primary"
          }
          disabled={requestState === "loading"}
          icon={
            requestState === "loading"
              ? Loader
              : requestState === "success"
                ? CheckCircle
                : requestState === "error"
                  ? XCircle
                  : Send
          }
          className="w-full h-12 justify-center whitespace-nowrap"
        >
          {requestState === "idle" && "Send Notification"}
          {requestState === "loading" && "Sending..."}
          {requestState === "success" && "Sent Successfully"}
          {requestState === "error" && "Error"}
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="animate-fadeIn">
          <div className="p-4 bg-green-950 border border-green-800 text-green-300 rounded-lg">
            ✓ {successMessage}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="animate-fadeIn">
          <div className="p-4 bg-red-950 border border-red-800 text-red-300 rounded-lg">
            ✕ {errorMessage}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <span className="font-medium">💡 Info:</span> Select "All Users" to
          send a notification to every user, or "Single User" to target a
          specific user by their ID.
        </p>
      </div>

      {/* Notes */}
      <div className="mt-8">
        <Heading>Instructions</Heading>
        <Text>
          Use this dashboard to send push notifications to your users. Enter a
          title and message body, then select whether to send to all users or a
          single user. If targeting a single user, provide their user ID. Press
          Ctrl+Enter or click the button to send.
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
