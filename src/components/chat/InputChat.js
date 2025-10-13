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
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    const userPrompt = message.trim();
    if (!activeConversation || (!userPrompt && !attachedDocumentId) || isSending)
      return;

    setIsSending(true);

    try {
      // Enviar mensagem do usuário
      onMessageSent?.({
        role: "user",
        sender: "user",
        content: userPrompt || "Processar arquivo",
        id: crypto.randomUUID(),
        attachedDocumentId: attachedDocumentId,
        attachedFileName: attachedFileName,
      });

      const conversationId = activeConversation?._id || activeConversation?.id;

      // Enviar para API (sem template)
      const data = await api.sendMessage(
        userPrompt || "Processar este arquivo",
        conversationId,
        attachedDocumentId
      );

      console.log("Resposta da API:", data); // Para debug

      // Limpar anexos após envio
      setAttachedDocumentId(null);
      setAttachedFileName(null);

      // Verificar diferentes campos possíveis da resposta
      const responseContent =
        data?.message_content ||
        data?.content ||
        data?.response ||
        data?.message ||
        data?.answer ||
        "Resposta recebida, mas conteúdo não identificado.";

      onMessageSent?.({
        role: "assistant",
        sender: "bot",
        content:
          data?.message_content ||
          data?.content ||
          "Aguarde um pouco.",
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
      setMessage("");
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
      {/* Área de anexo — mostra arquivo se houver */}
      {attachedDocumentId && (
        <div className="attachment-preview">
          <File
            documentId={attachedDocumentId}
            fileName={attachedFileName}
            onRemove={handleRemoveAttachment}
          />
        </div>
      )}

      {/* Área de input */}
      <div
        className={`chat-input ${attachedDocumentId ? "has-attachment" : ""}`}
      >
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
