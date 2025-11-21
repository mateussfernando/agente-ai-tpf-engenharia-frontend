const API_BASE_URL = "https://agente-ia-squad42.onrender.com";

// Função para pegar token do localStorage
function getToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    // Redireciona para login se não há token
    window.location.href = "/auth/login";
    throw new Error("Token não encontrado. Faça login novamente.");
  }
  return token;
}

// Função para tratar respostas HTTP
async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();

    // Se erro 401 (não autorizado), fazer logout automático
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
  }
  try {
    return res.json();
  } catch {
    return null;
  }
}

// Função específica para login que não redireciona
async function handleLoginResponse(res) {
  if (!res.ok) {
    const text = await res.text();

    // Para login, não redirecionar - apenas lançar erro
    if (res.status === 401) {
      throw new Error("Email ou senha incorretos.");
    }

    throw new Error(`Erro ${res.status}: ${text || res.statusText}`);
  }
  try {
    return res.json();
  } catch {
    return null;
  }
}

// Função auxiliar para requisições com token
async function fetchWithToken(url, options = {}) {
  const token = getToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  return handleResponse(res);
}

export const api = {
  /** Login */
  login: async (email, password) => {
    if (!email || !password) throw new Error("Email e senha são obrigatórios.");
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Usar função específica para login que não redireciona
    const data = await handleLoginResponse(res);

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
    } else {
      throw new Error("Token não retornado pelo servidor.");
    }

    return data;
  },

  /** Registro */
  register: async (name, email, password) => {
    if (!name || !email || !password) {
      throw new Error("Nome completo, email e senha são obrigatórios.");
    }

    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    return handleResponse(res);
  },

  /** Logout */
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  },

  /*informações do user*/
  getProfile: async () => {
    return fetchWithToken(`${API_BASE_URL}/api/auth/profile`);
  },

  /** rota das conversas*/

  getConversations: async () => {
    return fetchWithToken(`${API_BASE_URL}/api/chat/conversations`);
  },

  getConversationHistory: async (conversationId) => {
    if (!conversationId) throw new Error("ID da conversa é obrigatório.");
    return fetchWithToken(
      `${API_BASE_URL}/api/chat/conversations/${conversationId}`
    );
  },

  renameConversation: async (conversationId, newTitle) => {
    if (!conversationId || !newTitle)
      throw new Error("ID e título são obrigatórios");

    const url = `${API_BASE_URL}/api/chat/conversations/${conversationId}/rename`;

    return fetchWithToken(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_title: newTitle }),
    });
  },

  deleteConversation: async (conversationId) => {
    if (!conversationId) throw new Error("ID da conversa obrigatório");
    return fetchWithToken(
      `${API_BASE_URL}/api/chat/conversations/${conversationId}`,
      {
        method: "DELETE",
      }
    );
  },
  
  initConversation: async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/api/chat/conversations/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao iniciar conversa");
    }

    return await response.json();
  } catch (err) {
    console.error("Erro na initConversation:", err);
    throw err;
  }
},

  /** Fiz uma logica para enviar a mensagem o documento e o template */

  sendMessage: async (
    prompt,
    conversationId = null,
    attachedDocumentId = null,
    templateId = null // Mantido para compatibilidade, mas não usado
  ) => {
    if (!prompt) throw new Error("Mensagem não pode ser vazia.");
    const url = `${API_BASE_URL}/api/chat/conversations`;

    const requestBody = {
      prompt: prompt,
    };
    if (conversationId) {
      requestBody.conversation_id = conversationId;
    }
    if (attachedDocumentId) {
      requestBody.input_document_id = attachedDocumentId;
    }
    // template_id removido - backend identifica template pelo nome no prompt

    const data = await fetchWithToken(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    return data;
  },
  /**para lista os templates disponiveis **/
  getTemplates: async (page = 1, limit = 50) => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/api/templates?page=${page}&limit=${limit}`
    );
    // Backend retorna { data: [...], pagination: {...} }
    // Retornamos apenas os dados para manter compatibilidade
    return response?.data || response || [];
  },

  /** rotas dos documentos */
  uploadDocument: async (file) => {
    if (!file) throw new Error("Arquivo não selecionado.");
    const formData = new FormData();
    formData.append("file", file);
    return fetchWithToken(`${API_BASE_URL}/api/documents/upload`, {
      method: "POST",
      body: formData,
    });
  },

  downloadDocumentById: async (documentId) => {
    if (!documentId) throw new Error("ID do documento é obrigatório.");
    const token = getToken();

    const res = await fetch(
      `${API_BASE_URL}/api/documents/${documentId}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Falha ao baixar o documento. Erro HTTP: ${res.status}`);
    }

    const blob = await res.blob();
    return blob;
  },

  getDocumentMetadata: async (documentId) => {
    if (!documentId) throw new Error("ID do documento é obrigatório.");
    const token = getToken();

    const res = await fetch(
      `${API_BASE_URL}/api/documents/${documentId}/metadata`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Erro ao buscar metadados. Erro HTTP: ${res.status}`);
    }

    return await res.json();
  },
};
