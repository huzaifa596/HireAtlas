// components/Profile/TimelineItem.jsx
import React from "react";

const TimelineItem = ({
  title,
  subtitle,
  meta,
  dateRange,
  description,
  onEdit,
  onDelete,
  isLast,
}) => {
  return (
    <div className={`timeline-item ${isLast ? "timeline-item--last" : ""}`}>
      <div className="timeline-item__dot" />
      <div className="timeline-item__line" />

      <div className="timeline-item__content">
        <div className="timeline-item__header">
          <div className="timeline-item__info">
            <h3 className="timeline-item__title">{title}</h3>
            <p className="timeline-item__subtitle">{subtitle}</p>
            {meta && (
              <span className="timeline-item__meta">{meta}</span>
            )}
            <span className="timeline-item__date">📅 {dateRange}</span>
          </div>

          <div className="timeline-item__btns">
            <button
              className="icon-btn--edit"
              onClick={onEdit}
              title="Edit"
            >
              ✏️
            </button>
            <button
              className="icon-btn--delete"
              onClick={onDelete}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        {description && (
          <p className="timeline-item__description">{description}</p>
        )}
      </div>
    </div>
  );
};

export default TimelineItem;