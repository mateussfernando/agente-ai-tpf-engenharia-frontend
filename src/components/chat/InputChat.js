// Aqui onde funciona boa parte da logica, enivar a mensagem, o arqui e o template
import React, { useState } from "react";
import { FiSend, FiPlus } from "react-icons/fi";
import { api } from "../../api/Api";
import File from "./File";
import "../../style/chat.css";

export default function InputChat({
  activeConversation,
  onOpenAddFileModal,
  onMessageSent,
  attachedDocumentId,
  setAttachedDocumentId,
  attachedFileName,
  setAttachedFileName,
  attachedTemplateId,
  setAttachedTemplateId,
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

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
      // Enviar mensagem do usuário com template se houver
      onMessageSent?.({
        role: "user",
        sender: "user",
        content: userPrompt || "Processar arquivo com template",
        id: crypto.randomUUID(),
        attachedDocumentId: attachedDocumentId,
        attachedFileName: attachedFileName,
        templateId: attachedTemplateId,
      });

      const conversationId = activeConversation?._id || activeConversation?.id;

      // Enviar para API com templateId
      const data = await api.sendMessage(
        userPrompt || "Processar este arquivo com o template selecionado",
        conversationId,
        attachedDocumentId,
        attachedTemplateId
      );

      // Limpar anexos após envio
      setAttachedDocumentId(null);
      setAttachedFileName(null);
      setAttachedTemplateId(null);

      onMessageSent?.({
        role: "assistant",
        sender: "bot",
        content:
          data?.message_content || data?.content || "Processamento concluído",
        id: crypto.randomUUID(),
        generated_document_id: data?.document_id,
      });
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);

      const errorMessage = "Erro de conexão ou servidor. Tente novamente.";

      onMessageSent?.({
        role: "assistant",
        sender: "bot",
        content: errorMessage,
        id: crypto.randomUUID(),
      });
    } finally {
      setIsSending(false);
      setMessage("");
    }
  };

  const handleRemoveAttachment = () => {
    setAttachedDocumentId(null);
    setAttachedFileName(null);
    setAttachedTemplateId(null);
  };

  const handleRemoveTemplateOnly = () => {
    setAttachedTemplateId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPlaceholderText = () => {
    if (attachedDocumentId && attachedTemplateId)
      return "Digite instruções para processar o arquivo com o template...";
    if (attachedDocumentId) return "Digite suas instruções para o documento...";
    if (isSending) return "Aguardando resposta...";
    return "Digite sua mensagem...";
  };

  return (
    <div className="chat-input-container">
      {/* Área de anexo mostre arquivo e o template */}
      {(attachedDocumentId || attachedTemplateId) && (
        <div className="attachment-preview">
          {attachedDocumentId && (
            <File
              documentId={attachedDocumentId}
              fileName={attachedFileName}
              onRemove={handleRemoveAttachment}
            />
          )}
          {attachedTemplateId && (
            <div className="template-attachment">
              <div className="file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">Template selecionado</span>
              </div>
              <button
                className="remove-file-btn"
                onClick={
                  attachedDocumentId
                    ? handleRemoveTemplateOnly
                    : handleRemoveAttachment
                }
                title="Remover template"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <div
        className={`chat-input ${
          attachedDocumentId || attachedTemplateId ? "has-attachment" : ""
        }`}
      >
        <button
          className="add-file-btn"
          onClick={onOpenAddFileModal}
          disabled={isSending}
          title="Anexar arquivo e template"
        >
          <FiPlus className={attachedDocumentId ? "attached-icon" : ""} />
        </button>

        <input
          type="text"
          placeholder={getPlaceholderText()}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />

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
