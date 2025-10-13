import React, { useState } from "react";
import { MdOutlineClose, MdDriveFolderUpload, MdDescription } from "react-icons/md";
import { api } from "../../api/Api";
import "../../style/add-file.css";

export default function AddFileModal({ onFileUploaded, onClose, activeConversation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  async function handleFileUpload(file) {
    if (!file || !activeConversation) {
      setError("Selecione um arquivo e verifique a conversa ativa.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.uploadDocument(file);
      const documentId = data?.document?._id || data?._id;

      if (!documentId) {
        throw new Error("ID do documento não recebido da API.");
      }

      setUploadedFile({
        id: documentId,
        name: file.name,
        file: file,
      });

      // Chama callback após upload
      if (onFileUploaded) {
        onFileUploaded(documentId, file.name);
      }

      onClose();
    } catch (err) {
      console.error("Erro no upload do arquivo:", err);
      setError(err.message || "Erro ao enviar arquivo.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal add-file-modal modal-animate">
        <div className="modal-header">
          <h3>Enviar Arquivo</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <MdOutlineClose />
          </button>
        </div>

        <div className="modal-content">
          {error && <p className="error-message">{error}</p>}

          <div className="upload-section">
            <p className="modal-description">
              Faça upload do arquivo que você deseja enviar (DOC, DOCX, XLSX, etc.)
            </p>

            <label className={`file-upload-label ${isLoading ? "disabled" : ""}`}>
              <MdDriveFolderUpload className="upload-icon" />
              <span>{isLoading ? "Enviando..." : "Escolher Arquivo"}</span>
              <input
                type="file"
                onChange={handleFileChange}
                disabled={isLoading}
                style={{ display: "none" }}
                accept=".doc,.docx,.xlsx,.xls,.pdf,.txt"
              />
            </label>

            <div className="supported-formats">
              <small>Formatos suportados: DOC, DOCX, XLSX, XLS, PDF, TXT</small>
            </div>

            {uploadedFile && (
              <div className="uploaded-file-info">
                <MdDescription className="file-icon" />
                <div className="file-details">
                  <span className="file-name">{uploadedFile.name}</span>
                  <span className="file-status">✓ Arquivo enviado com sucesso</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
