import { useEffect } from "react";
import { createPortal } from "react-dom";

const ICONS = {
  error: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  warning:
    "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  confirm:
    "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const STYLES = {
  error: { iconColor: "#dc2626", iconBg: "#fee2e2" },
  success: { iconColor: "#166534", iconBg: "#dcfce7" },
  warning: { iconColor: "#d97706", iconBg: "#fef3c7" },
  info: { iconColor: "#1B2D4F", iconBg: "#dbeafe" },
  confirm: { iconColor: "#1B2D4F", iconBg: "#dbeafe" }, // ← navy/blue by default
};

export default function AlertBox({
  isOpen,
  type = "info",
  title,
  message,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmDanger = false, // ← new prop: true = red button, false = navy button
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { iconColor, iconBg } = STYLES[type];
  const isConfirm = type === "confirm";

  // confirmDanger=true → red button (delete/withdraw)
  // confirmDanger=false → navy button (publish/save)
  const confirmBtnColor = confirmDanger ? "#dc2626" : "#166534";

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "2rem",
          width: "420px",
          maxWidth: "90vw",
          border: "1px solid #e8edf2",
          animation: "alertIn 0.18s ease",
        }}
      >
        {/* Icon + Text */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={ICONS[type]} />
            </svg>
          </div>

          <div>
            <p
              style={{
                margin: "0 0 5px",
                fontSize: "15px",
                fontWeight: 600,
                color: "#1B2D4F",
              }}
            >
              {title}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{ borderTop: "1px solid #f1f5f9", marginBottom: "1.25rem" }}
        />

        {/* Buttons */}
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
        >
          {(isConfirm || type === "warning") && (
            <button
              onClick={onClose}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                padding: "9px 22px",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              {cancelLabel}
            </button>
          )}

          <button
            onClick={isConfirm ? onConfirm : onClose}
            style={{
              background: isConfirm ? confirmBtnColor : "#1B2D4F",
              color: "#fff",
              border: "none",
              padding: "9px 22px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {isConfirm ? confirmLabel : "OK"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes alertIn {
          from { opacity: 0; transform: scale(0.95) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
