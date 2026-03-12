import Heading from "../components/Heading";
import Text from "../components/Text";
import Button from "../components/Button";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { apiFetch } from "../helpers/apiFetch";

interface UserMeResponse {
  uid: number;
  firstname: string;
  birthdate: string;
  email: string;
  weight: string;
  height: string;
  gender: string;
  profile_image_url: string | null;
  onboarding_completed: number;
  fitness_level: string;
  training_frequency: number;
  primary_goal: string;
  role_id: number;
  last_login: string;
  created_at: string;
  updated_at: string;
  email_verified: number;
}

export default function UsersMe() {
  const BASE_URL = "https://api.properform.app";

  const [token, setToken] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestState, setRequestState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [userData, setUserData] = useState<UserMeResponse | null>(null);

  const stateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stateTimeoutRef.current) {
        window.clearTimeout(stateTimeoutRef.current);
      }
    };
  }, []);

  const handleGetUser = async () => {
    if (requestState === "loading") return;

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setErrorMessage("Please enter a token.");
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
      const result = await apiFetch(`${BASE_URL}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (result.ok) {
        const data: UserMeResponse = await result.json();

        setSuccessMessage("User data loaded successfully!");
        setErrorMessage("");
        setUserData(data);
        setRequestState("success");

        stateTimeoutRef.current = window.setTimeout(() => {
          setRequestState("idle");
          stateTimeoutRef.current = null;
        }, 5000);
      } else {
        setErrorMessage("Failed to load user data.");
        setSuccessMessage("");
        setUserData(null);
        setRequestState("error");

        stateTimeoutRef.current = window.setTimeout(() => {
          setRequestState("idle");
          stateTimeoutRef.current = null;
        }, 5000);
      }
    } catch {
      setErrorMessage("Error loading user data: Network error.");
      setSuccessMessage("");
      setUserData(null);
      setRequestState("error");

      stateTimeoutRef.current = window.setTimeout(() => {
        setRequestState("idle");
        stateTimeoutRef.current = null;
      }, 5000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && requestState !== "loading") {
      handleGetUser();
    }
  };

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Heading>User Profile</Heading>
      </div>

      {/* Input und Button Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          Auth Token
        </label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your token here..."
          disabled={requestState === "loading"}
          className="w-full px-5 py-3 border border-gray-600 bg-gray-900 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-800 disabled:text-gray-500 placeholder-gray-500 text-base"
        />

        <Button
          onClick={handleGetUser}
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
                  : undefined
          }
          className="w-full h-12 justify-center whitespace-nowrap"
        >
          {requestState === "idle" && "Load Profile"}
          {requestState === "loading" && "Loading..."}
          {requestState === "success" && "Loaded"}
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

      {/* User Data Display */}
      {userData && requestState !== "loading" && (
        <div className="animate-slideUp">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Profile Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">UID</p>
                <p className="text-2xl font-bold text-blue-400">
                  {userData.uid}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-100">
                  {userData.firstname}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 md:col-span-2">
                <p className="text-sm text-gray-400 font-medium mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-100">
                  {userData.email}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">Gender</p>
                <p className="text-sm text-gray-300 capitalize">
                  {userData.gender}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Birth Date
                </p>
                <p className="text-sm text-gray-300">
                  {new Date(userData.updated_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">Weight</p>
                <p className="text-sm text-gray-300">{userData.weight} kg</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">Height</p>
                <p className="text-sm text-gray-300">{userData.height} cm</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Fitness Level
                </p>
                <p className="text-sm text-gray-300 capitalize">
                  {userData.fitness_level}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Training Frequency
                </p>
                <p className="text-sm text-gray-300">
                  {userData.training_frequency}x per week
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Primary Goal
                </p>
                <p className="text-sm text-gray-300 capitalize">
                  {userData.primary_goal.replace(/_/g, " ")}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Onboarding
                </p>
                <p className="text-sm text-gray-300">
                  {userData.onboarding_completed ? "Completed" : "Pending"}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Email Verified
                </p>
                <p className="text-sm text-gray-300">
                  {userData.email_verified ? "Yes" : "No"}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">Role</p>
                <p className="text-sm text-gray-300">
                  {userData.role_id ? "User" : "Admin"}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Created
                </p>
                <p className="text-sm text-gray-300">
                  {new Date(userData.updated_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Last Login
                </p>
                <p className="text-sm text-gray-300">
                  {new Date(userData.updated_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 md:col-span-2">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Updated
                </p>
                <p className="text-sm text-gray-300">
                  {new Date(userData.updated_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mt-8">
        <Heading>Notes</Heading>
        <Text>
          Enter your auth token and click "Load Profile" to fetch your complete
          user profile information including personal details, fitness settings,
          and account status.
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
