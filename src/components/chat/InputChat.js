import React, { useState, useEffect } from 'react';
import { FiSend, FiPlus } from 'react-icons/fi';
import { api } from '../../api/Api';
import instructions from '../../utils/Instructions';
import AttachmentChips from './AttachmentChips';
import '../../style/chat.css';

export default function InputChat({
  activeConversation,
  ensureConversation,
  onOpenAddFileModal,
  onMessageSent,
  attachedDocumentId,
  setAttachedDocumentId,
  attachedFileName,
  setAttachedFileName,
  initialMessage = '',
  onMessageChange,
  hiddenTemplateInstructions = '',
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
    if ((!userPrompt && !attachedDocumentId) || isSending) return;

    setIsSending(true);

    try {
      const parts = [];
      if (hiddenTemplateInstructions) parts.push(hiddenTemplateInstructions);
      if (userPrompt) parts.push(userPrompt);

      const finalPrompt = parts.join('. ') || 'Processar este arquivo';

      // Variáveis para armazenar o ID da conversa e os dados da resposta
      let conversationId;
      let responseData;

      if (activeConversation) {
        conversationId = activeConversation._id || activeConversation.id;

        onMessageSent?.({
          role: 'user',
          sender: 'user',
          content: userPrompt || 'Processar arquivo',
          id: crypto.randomUUID(),
          attachedDocumentId,
          attachedFileName,
        });
        setMessage(''); // Limpar input

        responseData = await api.sendMessage(
          finalPrompt,
          conversationId,
          attachedDocumentId
        );
      } else {
        onMessageSent?.({
          role: 'user',
          sender: 'user',
          content: userPrompt || 'Processar arquivo',
          id: crypto.randomUUID(),
          attachedDocumentId,
          attachedFileName,
        });
        setMessage(''); // Limpar input

        const result = await ensureConversation(finalPrompt);
        if (result.conversation) {
          conversationId = result.conversation._id || result.conversation.id;
        } else {
          conversationId = null;
        }
        responseData = result.response;
      }

      // Limpar anexos após envio
      if (onClearAllAttachments) {
        onClearAllAttachments();
      } else {
        setAttachedDocumentId(null);
      }

      // Mostrar resposta do bot, usando os dados da resposta (responseData) obtidos no fluxo 1 ou 2
      onMessageSent?.({
        role: 'assistant',
        sender: 'bot',
        content:
          responseData?.message_content ||
          responseData?.content ||
          'Aguarde um pouco.',
        id: crypto.randomUUID(),
        generated_document_id: responseData?.document_id,
        conversation_id: conversationId,
      });
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);

      onMessageSent?.({
        role: 'assistant',
        sender: 'bot',
        content: 'Erro de conexão ou servidor. Tente novamente.',
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function getPlaceholderText() {
    if (attachedDocumentId) return 'Digite suas instruções para o documento...';
    if (isSending) return 'Aguardando resposta...';
    return 'Digite sua mensagem...';
  }

  return (
    <div className="chat-input-container">
      {(attachedTemplates?.length > 0 ||
        attachedFiles?.length > 0 ||
        attachedDocumentId) && (
        <div className="attachment-preview">
          <AttachmentChips
            templates={attachedTemplates}
            files={attachedFiles}
            onRemoveTemplate={onRemoveTemplate}
            onRemoveFile={onRemoveFile}
          />
        </div>
      )}

      <div
        className={`chat-input ${attachedDocumentId ? 'has-attachment' : ''}`}
      >
        <button
          className="add-file-btn"
          onClick={onOpenAddFileModal}
          disabled={isSending}
          title="Anexar arquivo"
        >
          <FiPlus className={attachedDocumentId ? 'attached-icon' : ''} />
        </button>

        <textarea
          placeholder={getPlaceholderText()}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onMessageChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />

        {/* Seletor de formato removido */}

        <button
          className={`send-btn ${message.trim() ? 'active' : ''}`}
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
