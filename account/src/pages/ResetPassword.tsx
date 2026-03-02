import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Check, Eye, EyeOff } from "lucide-react";

// ── Validation ────────────────────────────────────────────────────────────────
const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const isValid = (p: string) => rules.every((r) => r.test(p));
const isLongEnough = (p: string) => p.length >= 8;

// ── Animated check ────────────────────────────────────────────────────────────
function GreenCheck() {
  return (
    <span
      style={{
        position: "absolute",
        right: 40,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#4ade80",
        display: "flex",
        alignItems: "center",
        animation: "checkPop .3s cubic-bezier(.34,1.56,.64,1) both",
        pointerEvents: "none",
      }}
    >
      <Check size={15} strokeWidth={2.5} />
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [cfFocused, setCfFocused] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const pwValid = isValid(password);
  const cfValid = confirm.length > 0 && confirm === password;
  const canSubmit = pwValid && cfValid;

  const showRules = pwFocused || (password.length > 0 && !pwValid);
  const showCfHint = cfFocused || (confirm.length > 0 && !cfValid);

  useEffect(() => {
    if (isLongEnough(password)) setShowConfirm(true);
    else {
      setShowConfirm(false);
      setConfirm("");
    }
  }, [password]);

  const handleReset = async () => {
    setError("");
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.properform.app/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );
      const data = await res.json();
      if (!res.ok) setError(data.message || data.error || "Reset failed.");
      else setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  // border color helper
  const getBorder = (value: string, valid: boolean, focused: boolean) => {
    if (value.length > 0 && !valid) return "1.5px solid rgba(239,68,68,.6)";
    if (valid) return "1.5px solid rgba(74,222,128,.5)";
    if (focused) return "1.5px solid rgba(31,58,138,.7)";
    return "1.5px solid rgba(255,255,255,.08)";
  };

  const getGlow = (value: string, valid: boolean, focused: boolean) => {
    if (value.length > 0 && !valid) return "0 0 0 3px rgba(239,68,68,.08)";
    if (valid) return "0 0 0 3px rgba(74,222,128,.07)";
    if (focused) return "0 0 0 3px rgba(31,58,138,.18)";
    return "none";
  };

  const getBg = (value: string, valid: boolean) => {
    if (value.length > 0 && !valid) return "rgba(239,68,68,.04)";
    if (valid) return "rgba(74,222,128,.04)";
    return "rgba(255,255,255,.03)";
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (success) {
    return (
      <>
        <Styles />
        <div className="rp-page">
          <Grain />
          <div
            className="rp-card rp-card-enter"
            style={{ textAlign: "center", gap: 0 }}
          >
            <div className="rp-success-ring">
              <div className="rp-success-icon">
                <Check size={22} strokeWidth={2.5} color="#fff" />
              </div>
            </div>
            <h1 className="rp-heading" style={{ marginTop: 24 }}>
              Password updated
            </h1>
            <p className="rp-sub" style={{ marginBottom: 0 }}>
              Your password has been successfully reset.
            </p>
          </div>
        </div>
      </>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Styles />
      <div className="rp-page">
        <Grain />

        <div className="rp-card rp-card-enter">
          {/* Brand */}
          <div className="rp-brand-row">
            <span className="rp-dot" />
            <span className="rp-brand-name">ProPerform</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 className="rp-heading">Reset password</h1>
            <p className="rp-sub">
              Choose a strong new password for your account.
            </p>
          </div>

          {/* ── Password input ── */}
          <div className="rp-field">
            <label className="rp-label">New password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                className="rp-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                style={{
                  border: getBorder(password, pwValid, pwFocused),
                  boxShadow: getGlow(password, pwValid, pwFocused),
                  background: getBg(password, pwValid),
                  paddingRight: 72,
                }}
              />
              <button
                className="rp-eye"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              {pwValid && <GreenCheck />}
            </div>

            {/* Rules panel */}
            <div
              className={`rp-rules-wrap ${showRules ? "rp-rules-open" : ""}`}
            >
              <div className="rp-rules-box rp-rules-error">
                {rules.map((r) => {
                  const ok = r.test(password);
                  return (
                    <div
                      key={r.label}
                      className={`rp-rule ${ok ? "rp-rule-ok" : ""}`}
                    >
                      <span className="rp-rule-bullet" />
                      {r.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Confirm input (slides in) ── */}
          <div className={`rp-slide ${showConfirm ? "rp-slide-open" : ""}`}>
            <div className="rp-field">
              <label className="rp-label">Retype password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showCf ? "text" : "password"}
                  className="rp-input"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onFocus={() => setCfFocused(true)}
                  onBlur={() => setCfFocused(false)}
                  style={{
                    border: getBorder(confirm, cfValid, cfFocused),
                    boxShadow: getGlow(confirm, cfValid, cfFocused),
                    background: getBg(confirm, cfValid),
                    paddingRight: 72,
                  }}
                />
                <button
                  className="rp-eye"
                  onClick={() => setShowCf((v) => !v)}
                  tabIndex={-1}
                >
                  {showCf ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {cfValid && <GreenCheck />}
              </div>

              {/* Match hint */}
              <div
                className={`rp-rules-wrap ${showCfHint ? "rp-rules-open" : ""}`}
              >
                <div className="rp-rules-box rp-rules-error">
                  <div className={`rp-rule ${cfValid ? "rp-rule-ok" : ""}`}>
                    <span className="rp-rule-bullet" />
                    Passwords must match
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && <div className="rp-error">{error}</div>}

          {/* Button */}
          <button
            className="rp-btn"
            onClick={handleReset}
            disabled={loading || !canSubmit}
            style={{ opacity: !canSubmit && !loading ? 0.35 : 1 }}
          >
            {loading ? <span className="rp-spinner" /> : "Reset password"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Grain overlay ─────────────────────────────────────────────────────────────
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

// ── Styles ────────────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .rp-page {
        font-family: 'Inter', sans-serif;
        min-height: 100vh;
        background: #08090a;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        position: relative;
        overflow: hidden;
      }

      /* Ambient light blob */
      .rp-page::before {
        content: '';
        position: fixed;
        top: -30%;
        left: 50%;
        transform: translateX(-50%);
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(31,58,138,0.18) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
      }

      /* Card */
      .rp-card {
        position: relative;
        z-index: 1;
        background: rgba(255,255,255,.03);
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 20px;
        padding: 40px 36px;
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 0;
        backdrop-filter: blur(20px);
        box-shadow:
          0 0 0 1px rgba(255,255,255,.04) inset,
          0 24px 64px rgba(0,0,0,.5),
          0 4px 16px rgba(0,0,0,.3);
      }
      .rp-card-enter {
        animation: cardIn .5s cubic-bezier(.22,1,.36,1) both;
      }
      @keyframes cardIn {
        from { opacity:0; transform:translateY(24px) scale(.97); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }

      /* Brand */
      .rp-brand-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 32px;
      }
      .rp-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #1F3A8A;
        box-shadow: 0 0 12px 3px rgba(31,58,138,.7);
        flex-shrink: 0;
      }
      .rp-brand-name {
        font-size: 13.5px;
        font-weight: 600;
        color: rgba(255,255,255,.85);
        letter-spacing: -.01em;
      }

      /* Text */
      .rp-heading {
        font-size: 22px;
        font-weight: 600;
        color: #fff;
        letter-spacing: -.03em;
        line-height: 1.2;
        margin-bottom: 8px;
      }
      .rp-sub {
        font-size: 13px;
        color: rgba(255,255,255,.35);
        font-weight: 400;
        line-height: 1.55;
      }

      /* Field */
      .rp-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .rp-label {
        font-size: 12px;
        font-weight: 500;
        color: rgba(255,255,255,.4);
        letter-spacing: .03em;
        text-transform: uppercase;
      }

      /* Input */
      .rp-input {
        width: 100%;
        height: 46px;
        border-radius: 11px;
        padding: 0 14px;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        color: #fff;
        outline: none;
        transition: border .18s, box-shadow .18s, background .18s;
        letter-spacing: .01em;
      }
      .rp-input::placeholder { color: rgba(255,255,255,.2); }

      /* Eye */
      .rp-eye {
        position: absolute;
        right: pwValid ? 38px : 12px;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: rgba(255,255,255,.25);
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 4px;
        transition: color .15s;
        z-index: 1;
      }
      .rp-eye:hover { color: rgba(255,255,255,.7); }

      /* Rules */
      .rp-rules-wrap {
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transition: max-height .32s cubic-bezier(.4,0,.2,1), opacity .25s ease, margin-top .32s;
      }
      .rp-rules-open {
        max-height: 200px;
        opacity: 1;
        margin-top: 0;
      }
      .rp-rules-box {
        border-radius: 10px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 7px;
        margin-top: 8px;
      }
      .rp-rules-error {
        background: rgba(239,68,68,.06);
        border: 1px solid rgba(239,68,68,.2);
      }
      .rp-rule {
        font-size: 12px;
        color: rgba(239,68,68,.8);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: color .2s;
      }
      .rp-rule-ok { color: rgba(74,222,128,.85); }
      .rp-rule-bullet {
        width: 4px; height: 4px;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
        transition: background .2s;
      }

      /* Confirm slide */
      .rp-slide {
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transition: max-height .4s cubic-bezier(.4,0,.2,1), opacity .35s ease, margin-top .4s;
      }
      .rp-slide-open {
        max-height: 220px;
        opacity: 1;
        margin-top: 16px;
      }

      /* Error banner */
      .rp-error {
        font-size: 13px;
        color: rgba(239,68,68,.9);
        background: rgba(239,68,68,.06);
        border: 1px solid rgba(239,68,68,.18);
        border-radius: 10px;
        padding: 10px 14px;
        margin-top: 12px;
        animation: fadeUp .2s ease both;
      }

      /* Button */
      .rp-btn {
        margin-top: 24px;
        width: 100%;
        height: 46px;
        background: #1F3A8A;
        color: #fff;
        border: none;
        border-radius: 11px;
        font-size: 14px;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        letter-spacing: -.01em;
        transition: background .18s, transform .15s, opacity .18s, box-shadow .18s;
        box-shadow: 0 4px 20px rgba(31,58,138,.35);
        position: relative;
        overflow: hidden;
      }
      .rp-btn::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(255,255,255,.07) 0%, transparent 100%);
        pointer-events: none;
      }
      .rp-btn:hover:not(:disabled) {
        background: #2545a8;
        transform: translateY(-1px);
        box-shadow: 0 8px 28px rgba(31,58,138,.5);
      }
      .rp-btn:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 12px rgba(31,58,138,.3);
      }
      .rp-btn:disabled { cursor: not-allowed; }

      /* Spinner */
      .rp-spinner {
        width: 16px; height: 16px;
        border: 2px solid rgba(255,255,255,.25);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin .65s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Success */
      .rp-success-ring {
        width: 64px; height: 64px;
        border-radius: 50%;
        background: rgba(31,58,138,.15);
        border: 1px solid rgba(31,58,138,.3);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto;
        animation: successRing .5s cubic-bezier(.34,1.56,.64,1) both;
      }
      .rp-success-icon {
        width: 44px; height: 44px;
        border-radius: 50%;
        background: #1F3A8A;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 24px rgba(31,58,138,.6);
      }
      @keyframes successRing {
        from { opacity:0; transform:scale(.5); }
        to   { opacity:1; transform:scale(1); }
      }

      @keyframes checkPop {
        from { opacity:0; transform:translateY(-50%) scale(.4); }
        to   { opacity:1; transform:translateY(-50%) scale(1); }
      }
      @keyframes fadeUp {
        from { opacity:0; transform:translateY(-4px); }
        to   { opacity:1; transform:translateY(0); }
      }
    `}</style>
  );
}
