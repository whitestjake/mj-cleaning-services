

import { useState } from "react";

import "./subWindowModal.css";

const SubWindowModal = ({ title, data, fields, type, onClose, actions }) => {
  const [enlargedIndex, setEnlargedIndex] = useState(null);

  // ============================
  // PHOTO PREVIEW HANDLERS
  // ============================

  const openPhoto = (idx) => setEnlargedIndex(idx);
  const closePhoto = () => setEnlargedIndex(null);
  const nextPhoto = () => setEnlargedIndex((prev) => (prev + 1) % data.photos.length);
  const prevPhoto = () => setEnlargedIndex((prev) => (prev - 1 + data.photos.length) % data.photos.length);

  // ============================
  // DEFAULT ACTION BUTTONS
  // ============================

  const renderDefaultActions = () => {
    switch (type) {
      case "new":
        // "Send Quote" button should come from parent actions
        return actions || null;

      case "pending":
        // Accept/Reject buttons handled by parent
        return actions || null;

      case "queued":
        // "Mark as Completed" button handled by parent
        return actions || null;

      case "completed":
        return actions || null;
        
      case "client":
      default:
        // No default actions
        return null;
    }
  };

  // ============================
  // RENDER
  // ============================

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>{title}</h2>

        <div className="modal-content">
          {fields.map((field, idx) => (
            <p key={idx}>
              <strong>{field.label}:</strong>{" "}
              {field.render
                ? field.render(data[field.key], data)
                : data[field.key] ?? "-"}
            </p>
          ))}
        </div>

        {/* Photo gallery */}
        {data.photos && data.photos.length > 0 && (
          <div className="modal-photo-gallery">
            <h4>Uploaded Photos:</h4>
            <div className="photo-thumbnails">
              {data.photos.map((p, idx) => (
                <img
                  key={idx}
                  src={typeof p === "string" ? p : URL.createObjectURL(p)}
                  onClick={() => openPhoto(idx)}
                  alt=""
                />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {renderDefaultActions() && <div className="modal-actions">{renderDefaultActions()}</div>}

        {/* Enlarged photo overlay */}
        {enlargedIndex !== null && (
          <div className="enlarged-photo-overlay" onClick={closePhoto}>
            <button className="carousel-btn prev" onClick={(e) => { e.stopPropagation(); prevPhoto(); }}>‹</button>
            <img
              src={
                typeof data.photos[enlargedIndex] === "string"
                  ? data.photos[enlargedIndex]
                  : URL.createObjectURL(data.photos[enlargedIndex])
              }
              alt=""
            />
            <button className="carousel-btn next" onClick={(e) => { e.stopPropagation(); nextPhoto(); }}>›</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubWindowModal;




