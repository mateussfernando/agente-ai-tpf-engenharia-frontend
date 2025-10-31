import React, { useState, useEffect } from "react";
import { FiSend, FiPlus } from "react-icons/fi";
import { api } from "../../api/Api";
import AttachmentChips from "./AttachmentChips";
import "../../style/chat.css";

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
      const finalPrompt = hiddenTemplateInstructions
        ? `${hiddenTemplateInstructions}. ${userPrompt}`
        : userPrompt || "Processar este arquivo";

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
