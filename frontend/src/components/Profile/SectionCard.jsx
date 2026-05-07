// components/SectionCard.jsx
import React from "react";

const SectionCard = ({
  title,
  icon,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onAdd,
  addLabel = "Add",
  feedback,
  children,
}) => {
  return (
    <div className={`section-card ${isEditing ? "section-card--editing" : ""}`}>
      {/* Header */}
      <div className="section-card__header">
        <div className="section-card__title">
          <span className="section-card__icon">{icon}</span>
          <h2>{title}</h2>
        </div>

        <div className="section-card__actions">
          {!isEditing ? (
            <>
              {onAdd && (
                <button className="btn btn--ghost btn--sm" onClick={onAdd}>
                  + {addLabel}
                </button>
              )}
              <button
                className="btn btn--outline btn--sm btn--edit-icon"
                onClick={onEdit}
                title="Edit"
              >
                ✏️
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn--ghost btn--sm"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary btn--sm"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? <span className="spinner" /> : "💾 Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Feedback bar */}
      {feedback && (
        <div className={`section-feedback section-feedback--${feedback.type}`}>
          {feedback.type === "success" ? "✅" : "❌"} {feedback.message}
        </div>
      )}

      {/* Body */}
      <div className="section-card__body">{children}</div>
    </div>
  );
};

export default SectionCard;