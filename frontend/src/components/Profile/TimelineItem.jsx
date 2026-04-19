// components/TimelineItem.jsx
import React from "react";

/**
 * TimelineItem — display card for education / experience entries.
 *
 * Props:
 *   title        string   Degree or Job Title
 *   subtitle     string   Institute or Company
 *   meta         string?  e.g. "Bachelor's · 3.72/4.00"
 *   dateRange    string   Formatted date range string
 *   description  string?  Optional longer text (experience)
 *   onEdit       fn
 *   onDelete     fn
 *   isLast       bool     Hides the connecting line on the last item
 */
const TimelineItem = ({ title, subtitle, meta, dateRange, description, onEdit, onDelete, isLast }) => {
  return (
    <div className={`timeline-item ${isLast ? "timeline-item--last" : ""}`}>
      <div className="timeline-item__dot" />
      <div className="timeline-item__line" />

      <div className="timeline-item__content">
        <div className="timeline-item__header">
          <div className="timeline-item__info">
            <h3 className="timeline-item__title">{title}</h3>
            <p className="timeline-item__subtitle">{subtitle}</p>
            {meta && <span className="timeline-item__meta">{meta}</span>}
            <span className="timeline-item__date">{dateRange}</span>
          </div>

          <div className="timeline-item__btns">
            <button className="icon-btn icon-btn--edit" onClick={onEdit} title="Edit">✏️</button>
            <button className="icon-btn icon-btn--delete" onClick={onDelete} title="Delete">🗑️</button>
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
