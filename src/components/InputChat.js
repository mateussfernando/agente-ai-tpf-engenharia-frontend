import React, { useState } from "react";
import { FiSend, FiPlus } from "react-icons/fi";
import { api } from "../api/Api";
import "../style/chat.css";

export default function ChatInput({
  activeChat,
  onOpenAddFileModal,
  onMessageSent,
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    if (!activeChat || !message.trim() || isSending) return;

    setIsSending(true);
    const userMessage = {
      sender: "user",
      text: message.trim(),
      id: crypto.randomUUID(),
    };
    onMessageSent?.(userMessage);
    setMessage("");

    try {
      const data = await api.sendMessage(activeChat.id, message.trim());
      onMessageSent?.({
        sender: "bot",
        text:
          data?.text ||
          data?.response ||
          data?.message ||
          "Resposta não disponível.",
        id: crypto.randomUUID(),
      });
    } catch (err) {
      console.error(err);
      onMessageSent?.({
        sender: "bot",
        text: "Erro ao enviar mensagem. Tente novamente.",
        id: crypto.randomUUID(),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-input">
      <button
        className="add-file-btn"
        onClick={onOpenAddFileModal}
        disabled={isSending}
      >
        <FiPlus />
      </button>

      <input
        type="text"
        placeholder={
          isSending ? "Aguardando resposta..." : "Digite sua mensagem..."
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSending}
      />

      <button
        className="send-btn"
        onClick={sendMessage}
        disabled={isSending || !message.trim()}
      >
        <FiSend />
      </button>
    </div>
  );
}
