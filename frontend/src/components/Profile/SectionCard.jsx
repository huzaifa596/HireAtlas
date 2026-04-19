// components/SectionCard.jsx
import React from "react";

/**
 * SectionCard — wrapper for each profile section.
 *
 * Props:
 *   title      string    Section heading
 *   icon       string    Emoji / icon
 *   isEditing  bool      Whether this section is in edit mode
 *   isSaving   bool      Show spinner on Save button
 *   onEdit     fn        Called when Edit button clicked
 *   onSave     fn        Called when Save button clicked
 *   onCancel   fn        Called when Cancel clicked
 *   onAdd      fn?       If provided, shows an "+ Add" button
 *   addLabel   string?   Label for add button
 *   feedback   object?   { type: "success"|"error", message: string }
 *   children   node
 */
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
              <button className="btn btn--outline btn--sm" onClick={onEdit}>
                ✏️ Edit
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--ghost btn--sm" onClick={onCancel} disabled={isSaving}>
                Cancel
              </button>
              <button className="btn btn--primary btn--sm" onClick={onSave} disabled={isSaving}>
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
