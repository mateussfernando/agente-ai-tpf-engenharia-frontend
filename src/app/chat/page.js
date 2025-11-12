"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Modal from "@/components/modals/Modal";
import SidebarItem from "@/components/chat/SidebarItem";
import DocumentLink from "@/components/chat/DocumentLink";
import EnhancedAddFileModal from "@/components/modals/EnhancedAddFileModal";
import MenuPerfil from "@/components/layout/MenuPerfil";
import InputChat from "@/components/chat/InputChat";
import { FaUserCircle } from "react-icons/fa";
import { api } from "@/api/Api";
import "@/style/chat.css";
import "@/style/sidebar.css";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({
    name: "Carregando...",
    email: "carregando@email.com",
  });
  const [modal, setModal] = useState(null);
  const [showMenuPerfil, setShowMenuPerfil] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);

  // Estados para gerenciar os anexos (agora como arrays para múltiplos)
  const [attachedFiles, setAttachedFiles] = useState([]); // Array de {id, name}
  const [attachedTemplates, setAttachedTemplates] = useState([]); // Array de {id, name, instructions}

  // Estado para a mensagem atual do input
  const [currentMessage, setCurrentMessage] = useState("");

  // Manter compatibilidade com código existente (pega o primeiro ou null)
  const attachedDocumentId =
    attachedFiles.length > 0 ? attachedFiles[0].id : null;
  const attachedFileName =
    attachedFiles.length > 0 ? attachedFiles[0].name : null;
  const attachedTemplateId =
    attachedTemplates.length > 0 ? attachedTemplates[0].id : null;
  const hiddenTemplateInstructions = attachedTemplates
    .map((t) => t.instructions)
    .join(". ");

  const chatContainerRef = useRef(null);

  // Carrega conversas e usuário ao abrir
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [convData, userData] = await Promise.all([
          api.getConversations(),
          api.getProfile(),
        ]);

        setConversations(convData);
        setUser({ name: userData.name, email: userData.email });

        // Não seleciona nenhuma conversa
        // Não cria conversa automaticamente
      } catch (err) {
        console.error("Erro ao carregar chat:", err.message);
      }
    };
    load();
  }, []);


  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
  }, [messages]);

  // Função para selecionar uma conversa
  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    setAttachedFiles([]);
    setAttachedTemplates([]);
    setCurrentMessage(""); // Limpar mensagem atual ao trocar conversa
    try {
      const history = await api.getConversationHistory(
        conversation._id || conversation.id
      );
      setMessages(history || []);
    } catch {
      setMessages([]);
    }
  };

 async function ensureConversation(userMessageContent) {
    if (activeConversation) return { conversation: activeConversation, response: {} }; // Retorna objeto também se já existir

    // Esta é a chamada crítica que CRIA a conversa E envia a primeira mensagem
    const newConvResponse = await api.sendMessage(userMessageContent); 
    await new Promise((resolve) => setTimeout(resolve, 100));
    const convId = newConvResponse.conversation_id;

    const updatedList = await api.getConversations();
    setConversations(updatedList);

    const newConv = updatedList.find((c) => c._id === convId);
    setActiveConversation(newConv);

    // RETORNA UM OBJETO COM A CONVERSA E A RESPOSTA DO BACKEND
    return { conversation: newConv, response: newConvResponse }; 
}
  // Funções de renomear e excluir
  const handleRenameConversation = async (conversationId, newTitle) => {
    if (!conversationId || !newTitle) return alert("Título obrigatório");

    try {
      await api.renameConversation(conversationId, newTitle);
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, title: newTitle } : c
        )
      );
      closeModal();
    } catch (err) {
      alert("Erro ao renomear: " + err.message);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId) return alert("ID da conversa não encontrado");

    try {
      await api.deleteConversation(conversationId);
      const newConversations = conversations.filter(
        (c) => c._id !== conversationId
      );
      setConversations(newConversations);

      if (activeConversation && activeConversation._id === conversationId) {
        selectConversation(newConversations[0] || null);
      }
      closeModal();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleNewMessage = async (msg) => {
    console.log("Mensagem recebida:", msg); // Para debug
    setMessages((prev) => [...prev, msg]);

    // Se for uma mensagem do bot e há uma conversa ativa, recarregar o histórico
    if (msg.role === "assistant" || msg.sender === "bot") {
  const convId = activeConversation?._id || activeConversation?.id || msg.conversation_id;
  if (!convId) return; // ainda não tem conversa ativa

  try {
    setTimeout(async () => {
      const history = await api.getConversationHistory(convId);
      setMessages(history || []);
    }, 1000);
  } catch (err) {
    console.error("Erro ao recarregar histórico:", err);
  }
}
  };
  const closeModal = () => setModal(null);
  const onLogout = () => (window.location.href = "/auth/login");

  // Função avançada para formatar mensagens da IA
  const formatMessageContent = (content) => {
    if (!content) return null;

    // Dividir por linhas para processar cada uma
    const lines = content.split("\n");

    return lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();

      // Pular linhas vazias
      if (!trimmedLine) {
        return <br key={lineIndex} />;
      }

      // Detectar títulos (linha que termina com :)
      if (trimmedLine.endsWith(":") && !trimmedLine.includes("**")) {
        return (
          <div key={lineIndex} className="message-title">
            {processInlineFormatting(trimmedLine)}
          </div>
        );
      }

      // Detectar títulos entre **
      if (
        trimmedLine.startsWith("**") &&
        trimmedLine.endsWith("**") &&
        trimmedLine.length > 4
      ) {
        const titleText = trimmedLine.slice(2, -2);
        return (
          <div key={lineIndex} className="message-title">
            {titleText}
          </div>
        );
      }

      // Detectar listas numeradas (1., 2., etc.)
      const numberedListMatch = trimmedLine.match(/^(\d+\.)\s+(.+)$/);
      if (numberedListMatch) {
        const [, number, text] = numberedListMatch;
        return (
          <div key={lineIndex} className="message-list-item numbered">
            <span className="list-number">{number}</span>
            <span className="list-text">{processInlineFormatting(text)}</span>
          </div>
        );
      }

      // Detectar listas com bullet (* ou -)
      if (trimmedLine.match(/^[*-]\s+/)) {
        const listText = trimmedLine.replace(/^[*-]\s+/, "");
        return (
          <div key={lineIndex} className="message-list-item">
            <span className="list-bullet">•</span>
            <span className="list-text">
              {processInlineFormatting(listText)}
            </span>
          </div>
        );
      }

      // Texto normal com formatação inline
      return (
        <div key={lineIndex} className="message-paragraph">
          {processInlineFormatting(trimmedLine)}
        </div>
      );
    });
  };

  // Função para processar formatação inline (negrito, etc.)
  const processInlineFormatting = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return part;
    });
  };

  function handleFileUploaded(
    documentId,
    fileName,
    templateId,
    templateInstruction,
    autoSend = true,
    isHidden = false
  ) {
    setShowAddFileModal(false);

    if (templateInstruction) {
      if (autoSend) {
        // Envio automático (não usado mais)
        handleAutoSendTemplate(null, fileName, templateInstruction);
      } else {
        if (isHidden) {
          // Instruções ocultas - adiciona ao array de templates
          setAttachedTemplates((prev) => [
            ...prev,
            {
              id: templateId,
              name: fileName,
              instructions: templateInstruction,
            },
          ]);
          setCurrentMessage(""); // Campo vazio para o usuário digitar
        } else {
          // Instruções visíveis normais
          setCurrentMessage(templateInstruction);
          alert(
            `Template "${fileName}" adicionado ao chat! Complete com seu contexto específico (ex: "sobre energias renováveis") antes de enviar.`
          );
        }
      }
    } else {
      // Arquivo sem template - adiciona ao array de arquivos
      setAttachedFiles((prev) => [...prev, { id: documentId, name: fileName }]);
      alert(`Arquivo "${fileName}" anexado! Digite suas instruções.`);
    }
  }

  // Função para remover template antes de enviar
  function handleRemoveTemplate(templateId) {
    setAttachedTemplates((prev) => prev.filter((t) => t.id !== templateId));
  }

  // Função para remover arquivo antes de enviar
  function handleRemoveFile(fileId) {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  // Função para setar apenas o nome do arquivo anexado (compatibilidade)
  function setAttachedFileName(name) {
    if (name === null) {
      setAttachedFiles([]);
      return;
    }

    setAttachedFiles((prev) => {
      if (!prev || prev.length === 0) return prev;
      // Atualiza o nome do primeiro arquivo anexado
      return [{ id: prev[0].id, name }, ...prev.slice(1)];
    });
  }

  // Função para limpar todos os anexos após enviar mensagem
  function handleClearAllAttachments() {
    setAttachedFiles([]);
    setAttachedTemplates([]);
  }

  // Função para enviar automaticamente mensagem com template
  async function handleAutoSendTemplate(templateId, fileName, prompt) {
    if (!activeConversation) return;

    try {
      // Adicionar mensagem do usuário
      const userMessage = {
        role: "user",
        sender: "user",
        content: prompt,
        id: crypto.randomUUID(),
        attachedTemplateId: templateId,
        attachedFileName: fileName,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Enviar para API - backend identifica template pelo nome no prompt
      const conversationId = activeConversation?._id || activeConversation?.id;
      const data = await api.sendMessage(prompt, conversationId, null, null);

      // Adicionar resposta da IA
      const botMessage = {
        role: "assistant",
        sender: "bot",
        content:
          data?.message_content ||
          data?.content ||
          "Template processado com sucesso!",
        id: crypto.randomUUID(),
        generated_document_id: data?.document_id,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Erro ao processar template:", err);
      const errorMessage = {
        role: "assistant",
        sender: "bot",
        content: "Erro ao processar o template. Tente novamente.",
        id: crypto.randomUUID(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Image
            src="/TPF-AI.png"
            alt="TPF-AI Logo"
            width={120}
            height={40}
            priority
          />
        </div>

        <button
          className="new-chat"
          onClick={() => {
            setActiveConversation(null);
            setMessages([]);
            setAttachedFiles([]);
            setAttachedTemplates([]);
            setCurrentMessage("");
          }}
        >
          + Novo Chat
        </button>

        <h4>Histórico</h4>
        <div className="chat-list">
          {conversations
            .filter((conv) => conv && conv._id)
            .map((conv) => (
              <SidebarItem
                key={conv._id}
                conversation={conv}
                onRename={(conversation) =>
                  setModal({ type: "renomear", chat: conversation })
                }
                onDelete={(conversation) =>
                  setModal({ type: "excluir", chat: conversation })
                }
                onSelect={selectConversation}
                isActive={
                  activeConversation && activeConversation._id === conv._id
                }
              />
            ))}
        </div>

        <div
          className="user-profile"
          onClick={() => setShowMenuPerfil(!showMenuPerfil)}
        >
          <div className="user-icon-container">
            <FaUserCircle size={32} color="#000000ff" />
          </div>
          <span>{user.name}</span>
          {showMenuPerfil && (
            <MenuPerfil onLogout={onLogout} userEmail={user.email} />
          )}
        </div>
      </aside>

      {/* Chat principal */}
      <main className="chat-main">
        <div className="chat-messages-wrapper">
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((msg) => {
              let parsed = null;

              // converter o conteúdo em JSON para uma mensagem
              try {
                parsed = JSON.parse(msg.content);
              } catch {
                parsed = null;
              }

              // Define o conteúdo que será exibido (tratando no JSON )
              const displayContent =
                parsed && parsed.status === "success" && parsed.message
                  ? parsed.message
                  : msg.content;

              // Aplicar formatação apenas para mensagens da IA
              const formattedContent =
                msg.role === "assistant" || msg.sender === "bot"
                  ? formatMessageContent(displayContent)
                  : displayContent;

              // Define o ID do documento
              const documentId =
                (parsed && parsed.document_id) ||
                msg.document_id ||
                msg.generated_document_id;

              return (
                <div
                  key={msg._id || msg.id}
                  className={`message-bubble ${msg.role === "user" || msg.sender === "user"
                    ? "user"
                    : "bot"
                    }`}
                >
                  <div className="message-content">{formattedContent}</div>

                  {/* Exibe botão de download apenas se ouver o id do documento */}
                  {msg.role !== "user" && documentId && (
                    <div className="document-download-container">
                      <DocumentLink documentId={documentId} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <InputChat
          activeConversation={activeConversation}
          ensureConversation={ensureConversation}
          onMessageSent={handleNewMessage} onOpenAddFileModal={() => setShowAddFileModal(true)}
          attachedDocumentId={attachedDocumentId}
          setAttachedDocumentId={(id) => {
            if (id === null) setAttachedFiles([]);
            else setAttachedFiles([{ id, name: attachedFileName }]);
          }}
          attachedTemplates={attachedTemplates}
          attachedFiles={attachedFiles}
          onRemoveTemplate={handleRemoveTemplate}
          onRemoveFile={handleRemoveFile}
          onClearAllAttachments={handleClearAllAttachments} /> </main>

      {/* Modais */}
      {modal && modal.chat && (
        <Modal
          type={modal.type}
          chatTitle={modal.chat.title}
          onClose={closeModal}
          onConfirm={
            modal.type === "renomear"
              ? (newTitle) => handleRenameConversation(modal.chat._id, newTitle)
              : () => handleDeleteConversation(modal.chat._id)
          }
        />
      )}

      {showAddFileModal && (
        <EnhancedAddFileModal
          onClose={() => setShowAddFileModal(false)}
          activeConversation={activeConversation}
          onFileUploaded={handleFileUploaded}
        />
      )}
    </div>
  );
}
