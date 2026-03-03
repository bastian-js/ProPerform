import Heading from "../components/Heading";
import Text from "../components/Text";
import Button from "../components/Button";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, Loader } from "lucide-react";

interface TokenResponse {
  valid: boolean;
  uid: number;
  user: {
    uid: number;
    firstname: string;
    email: string;
    created_at: string;
    last_login: string | null;
  };
}

export default function CheckToken() {
  const BASE_URL = "https://api.properform.app";

  const [token, setToken] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestState, setRequestState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);

  const stateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stateTimeoutRef.current) {
        window.clearTimeout(stateTimeoutRef.current);
      }
    };
  }, []);

  const handleVerifyToken = async () => {
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
      const result = await fetch(`${BASE_URL}/auth/verify-token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${trimmedToken}`,
        },
      });

      if (result.ok) {
        const data: TokenResponse = await result.json();

        setSuccessMessage("Token is valid!");
        setErrorMessage("");
        setTokenData(data);
        setRequestState("success");

        stateTimeoutRef.current = window.setTimeout(() => {
          setRequestState("idle");
          stateTimeoutRef.current = null;
        }, 5000);
      } else {
        setErrorMessage("Token is invalid.");
        setSuccessMessage("");
        setTokenData(null);
        setRequestState("error");

        stateTimeoutRef.current = window.setTimeout(() => {
          setRequestState("idle");
          stateTimeoutRef.current = null;
        }, 5000);
      }
    } catch {
      setErrorMessage("Error verifying token: Network error.");
      setSuccessMessage("");
      setTokenData(null);
      setRequestState("error");

      stateTimeoutRef.current = window.setTimeout(() => {
        setRequestState("idle");
        stateTimeoutRef.current = null;
      }, 5000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && requestState !== "loading") {
      handleVerifyToken();
    }
  };

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Heading>Token Verification</Heading>
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
          onClick={handleVerifyToken}
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
          {requestState === "idle" && "Verify"}
          {requestState === "loading" && "Verifying..."}
          {requestState === "success" && "Verified"}
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

      {/* Token Data Display */}
      {tokenData && requestState !== "loading" && (
        <div className="animate-slideUp">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              User Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">UID</p>
                <p className="text-2xl font-bold text-blue-400">
                  {tokenData.uid}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-100">
                  {tokenData.user.firstname}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 md:col-span-2">
                <p className="text-sm text-gray-400 font-medium mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-100">
                  {tokenData.user.email}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Created
                </p>
                <p className="text-sm text-gray-300">
                  {new Date(tokenData.user.created_at).toLocaleDateString(
                    "en-US",
                  )}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Last Login
                </p>
                <p className="text-sm text-gray-300">
                  {tokenData.user.last_login
                    ? new Date(tokenData.user.last_login).toLocaleDateString(
                        "en-US",
                      )
                    : "Never"}
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
          Enter your full auth token and click "Verify" to check the validity of
          the token. If the token is valid, all user information will be
          displayed.
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
