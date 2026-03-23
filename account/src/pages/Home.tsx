import { useState, useEffect } from "react";
import {
  LogOut,
  Mail,
  User,
  Lock,
  Calendar,
  Check,
  AlertCircle,
  AlertTriangle,
  Ruler,
  Scale,
  Dumbbell,
  Activity,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../helpers/apiFetch";
import "../styles/account.css";

interface UserData {
  uid: number;
  firstname: string;
  email: string;
  birthdate: string;
  weight: number;
  height: number;
  gender: string;
  profile_image_url: string;
  onboarding_completed: boolean;
  fitness_level: string;
  training_frequency: number;
  primary_goal: string;
  role_id: number;
  last_login: string;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
}

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [logoutAllInfo, setLogoutAllInfo] = useState("");
  const [logoutAllError, setLogoutAllError] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("https://api.properform.app/users/me");
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load account data");
        if (res.status === 401) {
          navigate("/login");
        }
      } else {
        setUser(data);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      setResetError("No email found for this account.");
      setResetSuccess("");
      return;
    }

    setResetLoading(true);
    setResetError("");
    setResetSuccess("");

    try {
      const res = await fetch(
        "https://api.properform.app/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        },
      );

      let data: { message?: string; error?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        setResetError(
          data?.message || data?.error || "Could not send reset email.",
        );
      } else {
        setResetSuccess(
          data?.message || "Password reset email sent. Check your inbox.",
        );
      }
    } catch {
      setResetError("Network error. Please try again.");
    }

    setResetLoading(false);
  };

  const handleLogoutEverywhere = async () => {
    setLogoutAllLoading(true);
    setLogoutAllInfo("");
    setLogoutAllError("");

    try {
      const res = await apiFetch("https://api.properform.app/auth/logout/all", {
        method: "POST",
      });

      let data: { message?: string; error?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        setLogoutAllError(
          data?.message || data?.error || "Could not sign out all devices.",
        );
      } else {
        setLogoutAllInfo("This might take a while to affect all devices.");
      }
    } catch {
      setLogoutAllError("Network error. Please try again.");
    }

    setLogoutAllLoading(false);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <div className="account-page">
          <Grain />
          <div className="account-card account-card-enter">
            <div style={{ textAlign: "center" }}>
              <div className="account-spinner" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="account-page">
          <Grain />
          <div className="account-card account-card-enter">
            <div className="account-brand-row">
              <span className="account-dot" />
              <span className="account-brand-name">ProPerform</span>
            </div>
            <div className="account-error-section">
              <AlertCircle size={20} />
              <p>{error || "Failed to load account data"}</p>
              <button className="account-btn-secondary" onClick={fetchUser}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="account-page">
        <Grain />

        <div className="account-container">
          {/* Header Card */}
          <div className="account-card account-card-enter">
            <div className="account-header">
              <div className="account-header-content">
                <div className="account-brand-row">
                  <span className="account-dot" />
                  <span className="account-brand-name">ProPerform</span>
                </div>
                <h1 className="account-heading">Account</h1>
                <p className="account-sub">
                  Manage your account settings and information
                </p>
              </div>
              <button
                className="account-btn-logout"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* User Info Card */}
          <div
            className="account-card account-card-enter"
            style={{ "--delay": "0.08s" } as any}
          >
            <h2 className="account-section-title">Profile Information</h2>

            {error && (
              <div className="account-error">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Profile Image */}
            {user.profile_image_url && (
              <div
                style={{
                  marginBottom: 24,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src={user.profile_image_url}
                  alt="Profile"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,.08)",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            {/* Name and Email */}
            <div className="account-data-row">
              <div className="account-data-item">
                <div className="account-data-label">
                  <User size={14} />
                  First Name
                </div>
                <div className="account-data-value">
                  {user.firstname || "—"}
                </div>
              </div>
              <div className="account-data-item">
                <div className="account-data-label">
                  <Mail size={14} />
                  Email
                </div>
                <div className="account-data-value">{user.email || "—"}</div>
              </div>
            </div>

            {/* Physical Info */}
            <div className="account-data-row">
              <div className="account-data-item">
                <div className="account-data-label">
                  <Ruler size={14} />
                  Height
                </div>
                <div className="account-data-value">
                  {user.height ? `${user.height} cm` : "—"}
                </div>
              </div>
              <div className="account-data-item">
                <div className="account-data-label">
                  <Scale size={14} />
                  Weight
                </div>
                <div className="account-data-value">
                  {user.weight ? `${user.weight} kg` : "—"}
                </div>
              </div>
            </div>

            {/* Gender and Birthdate */}
            <div className="account-data-row">
              <div className="account-data-item">
                <div className="account-data-label">
                  <User size={14} />
                  Gender
                </div>
                <div
                  className="account-data-value"
                  style={{ textTransform: "capitalize" }}
                >
                  {user.gender || "—"}
                </div>
              </div>
              <div className="account-data-item">
                <div className="account-data-label">
                  <Calendar size={14} />
                  Birthdate
                </div>
                <div className="account-data-value">
                  {formatDate(user.birthdate)}
                </div>
              </div>
            </div>

            {/* Fitness Info */}
            <div className="account-data-row">
              <div className="account-data-item">
                <div className="account-data-label">
                  <Dumbbell size={14} />
                  Fitness Level
                </div>
                <div
                  className="account-data-value"
                  style={{ textTransform: "capitalize" }}
                >
                  {user.fitness_level
                    ? user.fitness_level.replace("_", " ")
                    : "—"}
                </div>
              </div>
              <div className="account-data-item">
                <div className="account-data-label">
                  <Activity size={14} />
                  Training Frequency
                </div>
                <div className="account-data-value">
                  {user.training_frequency
                    ? `${user.training_frequency}x per week`
                    : "—"}
                </div>
              </div>
            </div>

            {/* Primary Goal */}
            <div className="account-data-item account-data-item-spaced">
              <div className="account-data-label">
                <Target size={14} />
                Primary Goal
              </div>
              <div
                className="account-data-value"
                style={{ textTransform: "capitalize" }}
              >
                {user.primary_goal ? user.primary_goal.replace("_", " ") : "—"}
              </div>
            </div>

            {/* Dates */}
            <div className="account-data-row">
              <div className="account-data-item">
                <div className="account-data-label">
                  <Calendar size={14} />
                  Member Since
                </div>
                <div className="account-data-value">
                  {formatDate(user.created_at)}
                </div>
              </div>
              <div className="account-data-item">
                <div className="account-data-label">
                  <Calendar size={14} />
                  Last Login
                </div>
                <div className="account-data-value">
                  {formatDate(user.last_login)}
                </div>
              </div>
            </div>

            {/* Email Verified */}
            <div className="account-data-item">
              <div className="account-data-label">
                <Check size={14} />
                Email Verified
              </div>
              <div className="account-data-value">
                {user.email_verified ? (
                  <span style={{ color: "rgba(74,222,128,.85)" }}>
                    Verified
                  </span>
                ) : (
                  <span style={{ color: "rgba(239,68,68,.85)" }}>
                    Not Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div
            className="account-card account-card-enter"
            style={{ "--delay": "0.16s" } as any}
          >
            <h2 className="account-section-title">Account Actions</h2>

            {resetSuccess && (
              <div className="account-success">
                <Check size={14} />
                {resetSuccess}
              </div>
            )}

            {resetError && (
              <div className="account-error">
                <AlertCircle size={14} />
                {resetError}
              </div>
            )}

            {logoutAllInfo && (
              <div className="account-warning">
                <AlertTriangle size={14} />
                {logoutAllInfo}
              </div>
            )}

            {logoutAllError && (
              <div className="account-error">
                <AlertCircle size={14} />
                {logoutAllError}
              </div>
            )}

            <div className="account-actions">
              <button
                className="account-btn-secondary"
                onClick={handleChangePassword}
                disabled={resetLoading}
              >
                <Lock size={14} />
                {resetLoading ? "Sending email..." : "Change Password"}
              </button>
              <button
                className="account-btn-secondary account-btn-danger"
                onClick={handleLogoutEverywhere}
                disabled={logoutAllLoading}
              >
                <LogOut size={14} />
                {logoutAllLoading
                  ? "Signing out everywhere..."
                  : "Sign Out Everywhere"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Grain() {
  return (
    <svg
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.03,
        zIndex: 0,
      }}
    >
      <filter id="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}
