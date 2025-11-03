import React, { useState, useEffect } from "react";
import {
  MdOutlineClose,
  MdDriveFolderUpload,
  MdDescription,
  MdAutoFixHigh,
} from "react-icons/md";
import { api } from "../../api/Api";
import instructions from "../../utils/Instructions";
import "../../style/add-file.css";

export default function EnhancedAddFileModal({
  onFileUploaded,
  onClose,
  activeConversation,
}) {
  const [mode, setMode] = useState("upload"); // "upload" ou "template"
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Estados para templates
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  // Não expor seleção de tipo de processamento ao usuário.
  // O tipo será determinado pelo template (se houver) ou usado como 'pdf' por padrão.

  // Obter instruções do arquivo centralizado
  const getHiddenInstructions = (template) => {
    // Se o template trouxer um tipo explícito (ex: template.type), usar.
    // Caso contrário, usar a instrução de leitura padrão 'pdf'.
    const type =
      (template && (template.type || template.instructionType)) || "pdf";

    const categoryMap = {
      pdf: "documentTemplates",
      technicalAnalysis: "documentTemplates",
      executiveSummary: "documentTemplates",
      dataExtraction: "documentTemplates",
      toPdf: "conversionInstructions",
      toDocx: "conversionInstructions",
      toExcel: "conversionInstructions",
    };

    const category = categoryMap[type] || "documentTemplates";
    const instruction = instructions.getInstruction(category, type);

    return instruction;
  };

  // Carregar templates ao abrir o modal
  useEffect(() => {
    if (mode === "template") {
      loadTemplates();
    }
  }, [mode]);

  async function loadTemplates() {
    try {
      setIsLoading(true);
      const templatesData = await api.getTemplates();
      setTemplates(templatesData || []);
    } catch (err) {
      console.error("Erro ao carregar templates:", err);
      setError("Erro ao carregar templates disponíveis.");
    } finally {
      setIsLoading(false);
    }
  }

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

      if (onFileUploaded) {
        onFileUploaded(documentId, file.name, null);
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

  function handleTemplateSelect(template) {
    setSelectedTemplate(template);
    setError(null);
  }

  function handleUseTemplate() {
    if (!selectedTemplate) {
      setError("Selecione um template.");
      return;
    }

    // Buscar instruções do arquivo centralizado (tipo vindo do próprio template ou padrão)
    const hiddenInstructions = getHiddenInstructions(selectedTemplate);

    if (onFileUploaded) {
      // Passa as instruções ocultas para serem adicionadas ao input
      onFileUploaded(
        null,
        selectedTemplate.filename,
        null,
        hiddenInstructions,
        false, // nunca enviar automaticamente
        true // indica que são instruções ocultas
      );
    }

    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal add-file-modal modal-animate enhanced-modal">
        <div className="modal-header">
          <h3>Enviar Arquivo ou Usar Template</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <MdOutlineClose />
          </button>
        </div>

        <div className="modal-content">
          {error && <p className="error-message">{error}</p>}

          {/* Seletor de modo */}
          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === "upload" ? "active" : ""}`}
              onClick={() => setMode("upload")}
            >
              <MdDriveFolderUpload /> Upload de Arquivo
            </button>
            <button
              className={`mode-btn ${mode === "template" ? "active" : ""}`}
              onClick={() => setMode("template")}
            >
              <MdAutoFixHigh /> Usar Template
            </button>
          </div>

          {/* Modo Upload */}
          {mode === "upload" && (
            <div className="upload-section">
              <p className="modal-description">
                Faça upload do arquivo que você deseja enviar (DOC, DOCX, XLSX,
                etc.)
              </p>

              <label
                className={`file-upload-label ${isLoading ? "disabled" : ""}`}
              >
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
                <small>
                  Formatos suportados: DOC, DOCX, XLSX, XLS, PDF, TXT
                </small>
              </div>

              {uploadedFile && (
                <div className="uploaded-file-info">
                  <MdDescription className="file-icon" />
                  <div className="file-details">
                    <span className="file-name">{uploadedFile.name}</span>
                    <span className="file-status">
                      {" "}
                      ✓ Arquivo enviado com sucesso
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modo Template */}
          {mode === "template" && (
            <div className="template-section">
              <p className="modal-description">
                Selecione um template e escolha o tipo de documento. A instrução
                será adicionada ao campo de mensagem para que você possa
                complementar com detalhes específicos antes de enviar.
              </p>

              {/* Lista de templates */}
              <div className="template-list">
                <h4>Templates Disponíveis:</h4>
                {isLoading ? (
                  <p>Carregando templates...</p>
                ) : templates.length === 0 ? (
                  <p>Nenhum template disponível.</p>
                ) : (
                  <div className="templates-grid">
                    {templates.map((template) => (
                      <div
                        key={template._id}
                        className={`template-item ${
                          selectedTemplate?._id === template._id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <MdDescription className="template-icon" />
                        <span className="template-name">
                          {template.filename}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão para usar template selecionado */}
              {selectedTemplate && (
                <div className="template-actions">
                  <div className="template-action-info">
                    <small>
                      💡 O arquivo será preparado para leitura (tipo definido
                      pelo template). Adicione suas instruções específicas no
                      chat.
                    </small>
                  </div>
                  <button
                    className="use-template-btn"
                    onClick={handleUseTemplate}
                  >
                    Usar Template
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
