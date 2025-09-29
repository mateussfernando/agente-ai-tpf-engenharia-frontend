import React, { useState, useEffect, useRef } from "react";
import SidebarItem from "../../../Componetes/SidebarItem";
import Modal from "../../../Componetes/Modal";
import AddFileModal from "../../../Componetes/AddFileModal";
import MenuPerfil from "../../../Componetes/MenuPerfil";
import ChatInput from "../../../Componetes/InputChat";
import { FaUserCircle } from "react-icons/fa";
import { api } from "../../../Api/Api";
import "../../../Style/Chat.css";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({ name: "Carregando...", email: "carregando@email.com" });
  const [modal, setModal] = useState(null);
  const [showMenuPerfil, setShowMenuPerfil] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [chatsData, userData] = await Promise.all([api.getChats(), api.getUser()]);
        setChats(chatsData);
        setUser({ name: userData.name, email: userData.email });
        if (chatsData.length) {
          selectChat(chatsData[0]);
        } else {
          const newChat = await api.createChat();
          setChats([newChat]);
          selectChat(newChat);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const selectChat = async (chat) => {
    setActiveChat(chat);
    try {
      const history = await api.getChatMessages(chat.id);
      setMessages(history);
    } catch {
      setMessages([]);
    }
  };

 
  const handleRenameChat = (chatId, newTitle) => {
    api.renameChat(chatId, newTitle)
      .then(() => {
        setChats((prev) => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
        closeModal();
      })
      .catch(err => alert(err.message));
  };

  const handleDeleteChat = (chatId) => {
    api.deleteChat(chatId)
      .then(() => {
        setChats((prev) => prev.filter(c => c.id !== chatId));
        closeModal();
        setActiveChat(chats[0] || null);
      })
      .catch(err => alert(err.message));
  };

  const closeModal = () => setModal(null);

  const handleNewMessage = (msg) => setMessages((prev) => [...prev, msg]);

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">TPF<span>-AI</span></h2>
        <button className="new-chat" onClick={async () => {
          const newChat = await api.createChat();
          setChats((prev) => [...prev, newChat]);
          selectChat(newChat);
        }}>+ Novo Chat</button>

        <h4>Histórico</h4>
        {chats.map((chat) => (
          <SidebarItem
            key={chat.id}
            chatId={chat.id}
            text={chat.title || "Chat sem nome"}
            onRename={(id, title) => setModal({ type: "renomear", chat: { id, title } })}
            onDelete={(id, title) => setModal({ type: "excluir", chat: { id, title } })}
            onSelect={selectChat}
            isActive={activeChat?.id === chat.id}
          />
        ))}

        <div className="user-profile" onClick={() => setShowMenuPerfil(!showMenuPerfil)}>
          <div className="user-icon-container">
            <FaUserCircle size={32} color="#000000ff" />
          </div>
          <span>{user.name}</span>
          {showMenuPerfil && <MenuPerfil onLogout={onLogout} userEmail={user.email} />}
        </div>
      </aside>

      {/* Chat principal */}
      <main className="chat-main">
        <div className="chat-messages" ref={chatContainerRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.sender === "user" ? "user" : "bot"}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <ChatInput 
          activeChat={activeChat} 
          onMessageSent={handleNewMessage} 
          onOpenAddFileModal={() => setShowAddFileModal(true)} 
        />
      </main>

      {/* Modais */}
      {modal && (
        <Modal
          type={modal.type}
          chatTitle={modal.chat.title}
          onClose={closeModal}
          onConfirm={modal.type === "renomear"
            ? (newTitle) => handleRenameChat(modal.chat.id, newTitle)
            : () => handleDeleteChat(modal.chat.id)}
        />
      )}

      {showAddFileModal && (
        <AddFileModal 
          onClose={() => setShowAddFileModal(false)} 
          activeChat={activeChat} 
        />
      )}
    </div>
  );
}
