import React, { useState } from "react";
import { MdOutlineClose, MdDriveFolderUpload } from "react-icons/md";
import { api } from "../api/Api";
import "../style/add-file.css";

export default function AddFileModal({ onClose, activeChat }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    setIsUploading(true);
    setError(null);

    try {
      await api.uploadFile(activeChat.id, file);
      alert(`Arquivo "${file.name}" enviado com sucesso!`);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal add-file-modal modal-animate">
        <div className="modal-header">
          <h3>Adicionar Arquivo</h3>
          <button
            className="close-modal-btn"
            onClick={onClose}
            disabled={isUploading}
          >
            <MdOutlineClose />
          </button>
        </div>
        <div className="modal-content">
          {error && <p className="error-message">{error}</p>}
          <label
            className={`file-upload-label ${isUploading ? "disabled" : ""}`}
          >
            <MdDriveFolderUpload className="upload-icon" />
            <span>{isUploading ? "Processando..." : "Escolher Arquivo"}</span>
            <input
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
