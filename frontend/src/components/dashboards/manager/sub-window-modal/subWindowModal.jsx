


import { useState } from "react";

import "./subWindowModal.css";

const SubWindowModal = ({ title, data, fields, onClose, actions }) => {
  const [enlargedIndex, setEnlargedIndex] = useState(null);

  const openPhoto = (idx) => setEnlargedIndex(idx);
  const closePhoto = () => setEnlargedIndex(null);

  const nextPhoto = () => {
    if (data.photos && data.photos.length > 0) {
      setEnlargedIndex((prev) => (prev + 1) % data.photos.length);
    }
  };

  const prevPhoto = () => {
    if (data.photos && data.photos.length > 0) {
      setEnlargedIndex((prev) => (prev - 1 + data.photos.length) % data.photos.length);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>{title}</h2>

        <div className="modal-content">
          {fields.map((field, idx) => (
            <p key={idx}>
              <strong>{field.label}:</strong>{" "}
              {field.render ? field.render(data[field.key], data) : data[field.key] ?? "-"}
            </p>
          ))}
        </div>

        {data.photos && data.photos.length > 0 && (
          <div className="modal-photo-gallery">
            <h4>Uploaded Photos:</h4>
            <div className="photo-thumbnails">
              {data.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(photo)}
                  alt={`upload-${idx}`}
                  onClick={() => openPhoto(idx)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Enlarged Photo Carousel */}
        {enlargedIndex !== null && data.photos && data.photos.length > 0 && (
          <div className="enlarged-photo-overlay" onClick={closePhoto}>
            <button
              className="carousel-btn prev"
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
            >
              ‹
            </button>

            <img
              src={URL.createObjectURL(data.photos[enlargedIndex])}
              alt={`enlarged-${enlargedIndex}`}
            />

            <button
              className="carousel-btn next"
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
            >
              ›
            </button>
          </div>
        )}

        {/* --- Optional Action Buttons (NEW) --- */}
        {actions && (
          <div className="modal-actions">
            {actions}
          </div>
        )}

      </div>
    </div>
  );
};

export default SubWindowModal;


