import { useState } from "react";

import "./subWindowModal.css";

const allowedActionTypes = new Set(["new", "pending", "queued", "completed"]);

const SubWindowModal = ({ title, data, fields, type, onClose, actions }) => {
  const [enlargedIndex, setEnlargedIndex] = useState(null);
  const hasPhotos = Array.isArray(data.photos) && data.photos.length > 0;

  const openPhoto = (idx) => {
    if (!hasPhotos) return;
    setEnlargedIndex(idx);
  };
  const closePhoto = () => setEnlargedIndex(null);
  const nextPhoto = () => {
    if (!hasPhotos) return;
    setEnlargedIndex((prev) => (prev + 1) % data.photos.length);
  };
  const prevPhoto = () => {
    if (!hasPhotos) return;
    setEnlargedIndex((prev) => (prev - 1 + data.photos.length) % data.photos.length);
  };

  const shouldRenderActions = actions && allowedActionTypes.has(type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>x</button>
        <h2>{title}</h2>

        <div className="modal-content">
          {fields.map((field, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <strong>{field.label}:</strong>{" "}
              {field.render
                ? field.render(data[field.key], data)
                : data[field.key] ?? "-"}
            </div>
          ))}
        </div>

        {/* Photo gallery */}
        {hasPhotos && (
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

        {shouldRenderActions && <div className="modal-actions">{actions}</div>}

        {/* Enlarged photo overlay */}
        {enlargedIndex !== null && (
          <div className="enlarged-photo-overlay" onClick={closePhoto}>
            <button className="carousel-btn prev" onClick={(e) => { e.stopPropagation(); prevPhoto(); }}>&lt;</button>
            <img
              src={
                typeof data.photos[enlargedIndex] === "string"
                  ? data.photos[enlargedIndex]
                  : URL.createObjectURL(data.photos[enlargedIndex])
              }
              alt=""
            />
            <button className="carousel-btn next" onClick={(e) => { e.stopPropagation(); nextPhoto(); }}>&gt;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubWindowModal;




