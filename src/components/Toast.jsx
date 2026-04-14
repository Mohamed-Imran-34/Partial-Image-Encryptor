import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, XCircle, X } from "lucide-react";

// ── ToastItem ────────────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Mount → slide in
    requestAnimationFrame(() => setVisible(true));

    // Auto dismiss
    const timer = setTimeout(() => dismiss(), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 400);
  };

  const config = {
    success: {
      icon: <CheckCircle size={20} />,
      accent: "#00ff88",
      glow: "rgba(0, 255, 136, 0.35)",
      bg: "rgba(0, 255, 136, 0.08)",
      border: "rgba(0, 255, 136, 0.35)",
      bar: "linear-gradient(90deg, #00ff88, #00cc6a)",
    },
    error: {
      icon: <XCircle size={20} />,
      accent: "#ff4f4f",
      glow: "rgba(255, 79, 79, 0.35)",
      bg: "rgba(255, 79, 79, 0.08)",
      border: "rgba(255, 79, 79, 0.35)",
      bar: "linear-gradient(90deg, #ff4f4f, #cc0000)",
    },
    info: {
      icon: <AlertCircle size={20} />,
      accent: "#00f2ff",
      glow: "rgba(0, 242, 255, 0.35)",
      bg: "rgba(0, 242, 255, 0.08)",
      border: "rgba(0, 242, 255, 0.35)",
      bar: "linear-gradient(90deg, #00f2ff, #2575fc)",
    },
  };

  const c = config[toast.type ?? "info"];
  const duration = toast.duration ?? 4000;

  return (
    <>
      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @media (max-width: 480px) {
          .toast-item {
            min-width: unset !important;
            max-width: unset !important;
            width: 100% !important;
          }
        }
      `}</style>
      <div
        className="toast-item"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          padding: "14px 16px",
          borderRadius: "14px",
          background: `rgba(5, 5, 8, 0.92)`,
          border: `1px solid ${c.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${c.glow}`,
          backdropFilter: "blur(16px)",
          overflow: "hidden",
          minWidth: "280px",       // ← reduced from 300px
          maxWidth: "420px",
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          opacity: visible && !leaving ? 1 : 0,
          transform: visible && !leaving
            ? "translateX(0) scale(1)"
            : "translateX(60px) scale(0.92)",
          pointerEvents: "all",
          boxSizing: "border-box",
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "3px",
            borderRadius: "0 0 0 14px",
            background: c.bar,
            animation: `toast-shrink ${duration}ms linear forwards`,
          }}
        />

        {/* Icon */}
        <div style={{ color: c.accent, marginTop: "1px", flexShrink: 0 }}>
          {c.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {toast.title && (
            <div
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: c.accent,
                letterSpacing: "0.5px",
                marginBottom: toast.message ? "4px" : 0,
                wordBreak: "break-word",
              }}
            >
              {toast.title}
            </div>
          )}
          {toast.message && (
            <div
              style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: "0.82rem",
                color: "#ccc",
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {toast.message}
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer",
            padding: "2px",
            flexShrink: 0,
            transition: "color 0.2s",
            lineHeight: 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#666")}
        >
          <X size={16} />
        </button>
      </div>
    </>
  );
}

// ── ToastContainer ───────────────────────────────────────────────────────────
export function ToastContainer({ toasts, removeToast }) {
  return (
    <>
      <style>{`
        .toast-container {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
          /* desktop: natural width from children */
          max-width: calc(100vw - 32px);
          box-sizing: border-box;
        }
        @media (max-width: 480px) {
          .toast-container {
            /* on small screens: stretch edge-to-edge with margin */
            left: 12px;
            right: 12px;
            top: 12px;
            max-width: unset;
          }
        }
      `}</style>
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </>
  );
}

// ── useToast hook ─────────────────────────────────────────────────────────────
let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type = "info", title, message, duration = 4000 }) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  };

  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  const toast = {
    success: (title, message, duration) => addToast({ type: "success", title, message, duration }),
    error:   (title, message, duration) => addToast({ type: "error",   title, message, duration }),
    info:    (title, message, duration) => addToast({ type: "info",    title, message, duration }),
  };

  return { toasts, removeToast, toast };
}