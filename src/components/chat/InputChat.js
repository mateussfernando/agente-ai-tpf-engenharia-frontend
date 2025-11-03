import React, { useState, useEffect } from "react";
import { FiSend, FiPlus } from "react-icons/fi";
import { api } from "../../api/Api";
import instructions from "../../utils/Instructions";
import AttachmentChips from "./AttachmentChips";
import "../../style/chat.css";
import "../../style/response-format-selector.css";

export default function InputChat({
  activeConversation,
  onOpenAddFileModal,
  onMessageSent,
  attachedDocumentId,
  setAttachedDocumentId,
  attachedFileName,
  setAttachedFileName,
  initialMessage = "",
  onMessageChange,
  hiddenTemplateInstructions = "",
  setHiddenTemplateInstructions,
  attachedTemplates = [], // Array de templates
  attachedFiles = [], // Array de arquivos
  onRemoveTemplate,
  onRemoveFile,
  onClearAllAttachments, // Nova prop para limpar tudo após envio
}) {
  const [message, setMessage] = useState(initialMessage);
  const [isSending, setIsSending] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("text");

  // Atualizar mensagem quando initialMessage mudar
  useEffect(() => {
    if (initialMessage !== message) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const sendMessage = async () => {
    const userPrompt = message.trim();
    if (
      !activeConversation ||
      (!userPrompt && !attachedDocumentId) ||
      isSending
    )
      return;

    setIsSending(true);

    try {
      // Combinar instruções ocultas do template com a mensagem do usuário
      // e adicionar instrução de conversão caso o usuário tenha escolhido um formato
      let conversionInstruction = "";
      if (selectedFormat && selectedFormat !== "text") {
        conversionInstruction = instructions.getInstruction(
          "conversionInstructions",
          selectedFormat
        );
      }

      const parts = [];
      if (hiddenTemplateInstructions) parts.push(hiddenTemplateInstructions);
      if (conversionInstruction) parts.push(conversionInstruction);
      if (userPrompt) parts.push(userPrompt);

      const finalPrompt = parts.join(". ") || "Processar este arquivo";

      // Enviar mensagem do usuário (mostra apenas o que o usuário digitou)
      onMessageSent?.({
        role: "user",
        sender: "user",
        content: userPrompt || "Processar arquivo",
        id: crypto.randomUUID(),
        attachedDocumentId,
        attachedFileName,
      });

      const conversationId = activeConversation?._id || activeConversation?.id;

      // Limpa o input imediatamente após enviar
      setMessage("");

      // Enviar para API
      const data = await api.sendMessage(
        finalPrompt,
        conversationId,
        attachedDocumentId
      );

      // Limpar anexos após envio
      if (onClearAllAttachments) {
        onClearAllAttachments();
      } else {
        // Fallback para compatibilidade
        setAttachedDocumentId(null);
        setAttachedFileName(null);
      }

      // Mostrar resposta do bot
      onMessageSent?.({
        role: "assistant",
        sender: "bot",
        content: data?.message_content || data?.content || "Aguarde um pouco.",
        id: crypto.randomUUID(),
        generated_document_id: data?.document_id,
      });
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);

      onMessageSent?.({
        role: "assistant",
        sender: "bot",
        content: "Erro de conexão ou servidor. Tente novamente.",
        id: crypto.randomUUID(),
      });
    } finally {
      setIsSending(false);
    }
  };

  function handleRemoveAttachment() {
    setAttachedDocumentId(null);
    setAttachedFileName(null);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function getPlaceholderText() {
    if (attachedDocumentId) return "Digite suas instruções para o documento...";
    if (isSending) return "Aguardando resposta...";
    return "Digite sua mensagem...";
  }

  return (
    <div className="chat-input-container">
      {attachedDocumentId && (
        <div className="attachment-preview">
          <File
            documentId={attachedDocumentId}
            fileName={attachedFileName}
            onRemove={handleRemoveAttachment}
          />
        </div>
      )}

      <div className={`chat-input ${attachedDocumentId ? "has-attachment" : ""}`}>
        <button
          className="add-file-btn"
          onClick={onOpenAddFileModal}
          disabled={isSending}
          title="Anexar arquivo"
        >
          <FiPlus className={attachedDocumentId ? "attached-icon" : ""} />
        </button>

        <input
          type="text"
          placeholder={getPlaceholderText()}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onMessageChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />

          {/* Seletor de formato de resposta */}
          <div className="response-format-selector-floating">
            <label className="response-format-label" htmlFor="response-format">
              Formato:
            </label>
            <select
              id="response-format"
              className="response-format-select"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              disabled={isSending}
              title="Escolher formato de resposta"
            >
              <option value="text">Texto</option>
              <option value="toPdf">PDF</option>
              <option value="toDocx">Word (DOCX)</option>
              <option value="toExcel">Excel</option>
            </select>
          </div>

        <button
          className={`send-btn ${message.trim() ? "active" : ""}`}
          onClick={sendMessage}
          disabled={isSending || (!message.trim() && !attachedDocumentId)}
          title="Enviar mensagem"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}
