"use client";
import React, { useState, useEffect, useRef } from "react";
import Modal from "@/components/modals/Modal";
import SidebarItem from "@/components/chat/SidebarItem";
import DocumentLink from "@/components/chat/DocumentLink";
import AddFileModal from "@/components/modals/AddFileModal";
import MenuPerfil from "@/components/layout/MenuPerfil";
import InputChat from "@/components/chat/InputChat";
import { FaUserCircle } from "react-icons/fa";
import { api } from "@/api/Api";
import "@/style/chat.css";

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

  // Estados para gerenciar os anexos
  const [attachedDocumentId, setAttachedDocumentId] = useState(null);
  const [attachedFileName, setAttachedFileName] = useState(null);

  const chatContainerRef = useRef(null);
  const [currentMessage, setCurrentMessage] = useState("");

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

        if (convData.length) selectConversation(convData[0]);
        else {
          const newConvData = await api.sendMessage("Olá, TPF-AI!");
          setConversations((prev) => [newConvData.conversation, ...prev]);
          selectConversation(newConvData.conversation);
        }
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
    setAttachedDocumentId(null);
    setAttachedFileName(null);
    try {
      const history = await api.getConversationHistory(
        conversation._id || conversation.id
      );
      setMessages(history || []);
    } catch {
      setMessages([]);
    }
  };

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
    if (
      (msg.role === "assistant" || msg.sender === "bot") &&
      activeConversation
    ) {
      try {
        // Aguardar um pouco para garantir que a API processou a mensagem
        setTimeout(async () => {
          console.log("Recarregando histórico da conversa..."); // Para debug
          const history = await api.getConversationHistory(
            activeConversation._id || activeConversation.id
          );
          console.log("Histórico carregado:", history); // Para debug
          setMessages(history || []);
        }, 1000);
      } catch (err) {
        console.error("Erro ao recarregar histórico:", err);
      }
    }
  };
  const closeModal = () => setModal(null);
  const onLogout = () => (window.location.href = "/auth/login");

  function handleFileUploaded(documentId, fileName) {
    setAttachedDocumentId(documentId);
    setAttachedFileName(fileName);
    setShowAddFileModal(false);

    alert(
      `Arquivo "${fileName}" Digite suas instruções.`
    );
  }

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1 className="logo">
          TPF<span>-AI</span>
        </h1>

        <button
          className="new-chat"
          onClick={async () => {
            try {
              setActiveConversation(null);
              setMessages([]);
              setAttachedDocumentId(null);
              setAttachedFileName(null);

              const apiResponse = await api.sendMessage("Novo chat iniciado");

              if (!apiResponse || !apiResponse.conversation_id) {
                throw new Error("API não retornou o ID da nova conversa.");
              }
              const newConvList = await api.getConversations();
              const newConversation =
                newConvList.find(
                  (c) => c._id === apiResponse.conversation_id
                ) || newConvList[0];

              if (!newConversation) {
                throw new Error(
                  "Falha ao recuperar os dados da nova conversa."
                );
              }

              setConversations(newConvList);
              selectConversation(newConversation);
            } catch (err) {
              console.error("Erro ao criar novo chat:", err.message);
            }
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

            // Define o ID do documento
            const documentId =
              (parsed && parsed.document_id) ||
              msg.document_id ||
              msg.generated_document_id;

            return (
              <div
                key={msg._id || msg.id}
                className={`message-bubble ${msg.role === "user" || msg.sender === "user" ? "user" : "bot"
                  }`}
              >
                <div className="message-content">{displayContent}</div>

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


        <InputChat
          activeConversation={activeConversation}
          onMessageSent={handleNewMessage}
          onOpenAddFileModal={() => setShowAddFileModal(true)}
          attachedDocumentId={attachedDocumentId}
          setAttachedDocumentId={setAttachedDocumentId}
          attachedFileName={attachedFileName}
          setAttachedFileName={setAttachedFileName}
          
        />
      </main>

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
        <AddFileModal
          onClose={() => setShowAddFileModal(false)}
          activeConversation={activeConversation}
          onFileUploaded={handleFileUploaded}
        />
      )}
    </div>
  );
}
