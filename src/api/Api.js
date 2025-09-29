const API_BASE_URL = "link";

export const api = {
  getChats: async () => {
    const res = await fetch(`${API_BASE_URL}/chats`);
    if (!res.ok) throw new Error("Falha ao buscar chats.");
    return res.json();
  },

  getUser: async () => {
    const res = await fetch(`${API_BASE_URL}/user/me`);
    if (!res.ok) throw new Error("Falha ao buscar usuário.");
    return res.json();
  },

  getChatMessages: async (chatId) => {
    const res = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`);
    if (!res.ok) throw new Error("Falha ao carregar histórico.");
    return res.json();
  },

  createChat: async (title = "Chat Ativo") => {
    const res = await fetch(`${API_BASE_URL}/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Falha ao criar chat.");
    return res.json();
  },

  renameChat: async (chatId, newTitle) => {
    const res = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) throw new Error("Falha ao renomear chat.");
    return res.json();
  },

  deleteChat: async (chatId) => {
    const res = await fetch(`${API_BASE_URL}/chats/${chatId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Falha ao excluir chat.");
    return true;
  },

  sendMessage: async (chatId, message) => {
    const res = await fetch(`${API_BASE_URL}/chats/${chatId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Falha ao enviar mensagem.");
    return res.json();
  },

  uploadFile: async (chatId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", chatId);

    const res = await fetch(`${API_BASE_URL}/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Falha ao enviar arquivo.");
    return res.json();
  },
};
