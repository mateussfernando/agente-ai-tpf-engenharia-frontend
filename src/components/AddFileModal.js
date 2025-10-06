import React, { useState, useEffect } from "react";
import { MdOutlineClose, MdDriveFolderUpload, MdDescription } from "react-icons/md";
import { api } from "../api/Api";
import "../style/add-file.css";

export default function AddFileModal({ onFileUploaded, onClose, activeConversation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (currentStep === 2) {
      loadTemplates();
    }
  }, [currentStep]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const templatesData = await api.getTemplates();
      setTemplates(templatesData || []);
    } catch (err) {
      console.error("Erro ao carregar templates:", err);
      setError("Erro ao carregar templates. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
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
        file: file
      });

      // Avançar para seleção de template
      setCurrentStep(2);

    } catch (err) {
      console.error("Erro no upload do arquivo:", err);
      setError(err.message || "Erro ao enviar arquivo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleTemplateSelect = async (template) => {
    if (!uploadedFile) return;

    try {
      // Aqui você envia tanto o documento quanto o template 
      const processingData = {
        documentId: uploadedFile.id,
        templateId: template._id,
        fileName: uploadedFile.name,
        templateName: template.name
      };

      console.log("Processando:", processingData);

      // Chama a função de callback com ambos os IDs
      if (onFileUploaded) {
        onFileUploaded(uploadedFile.id, uploadedFile.name, template._id);
      }

      onClose();

    } catch (err) {
      console.error("Erro ao processar:", err);
      setError("Erro ao selecionar template.");
    }
  };

  const goBackToUpload = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setSelectedTemplate(null);
    setError(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal add-file-modal modal-animate">
        <div className="modal-header">
          <h3>
            {currentStep === 1 ? "Enviar Arquivo" : "Selecionar Template"}
          </h3>
          <button className="close-modal-btn" onClick={onClose}>
            <MdOutlineClose />
          </button>
        </div>

        <div className="modal-steps">
          <div className="step-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span>1</span>
              Upload
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span>2</span>
              Template
            </div>
          </div>
        </div>

        <div className="modal-content">
          {error && <p className="error-message">{error}</p>}

          {/* PASSO 1: UPLOAD DO ARQUIVO */}
          {currentStep === 1 && (
            <div className="upload-section">
              <p className="modal-description">
                Faça upload do arquivo que você deseja processar (DOC, DOCX, XLSX, etc.)
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
            </div>
          )}

          {/* PASSO 2: SELEÇÃO DO TEMPLATE */}
          {currentStep === 2 && uploadedFile && (
            <div className="templates-section">
              <div className="uploaded-file-info">
                <MdDescription className="file-icon" />
                <div className="file-details">
                  <span className="file-name">{uploadedFile.name}</span>
                  <span className="file-status">✓ Arquivo enviado com sucesso</span>
                </div>
                <button className="change-file-btn" onClick={goBackToUpload}>
                  Alterar
                </button>
              </div>

              <p className="modal-description">
                Selecione um template para processar o arquivo:
              </p>

              {isLoading ? (
                <div className="loading-templates">
                  <p>Carregando templates...</p>
                </div>
              ) : (
                <div className="templates-list">
                  {templates.map(template => (
                    <div
                      key={template._id}
                      className={`template_name ${selectedTemplate?._id === template._id ? "selected" : ""}`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <MdDescription className="template-icon" />
                      <div className="template-info">
                        <span className="template-name">
                          {template.name}
                        </span>
                        {template.description && (
                          <span className="template-description">
                            {template.description}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {templates.length === 0 && (
                    <div className="no-templates">
                      <MdDescription className="no-templates-icon" />
                      <p>Nenhum template disponível</p>
                      <small>Entre em contato com o administrador para adicionar templates.</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}