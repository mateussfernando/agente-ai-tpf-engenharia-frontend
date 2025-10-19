import React from "react";
import { api } from "../../api/Api";
import { FaDownload } from "react-icons/fa";

export default function DocumentLink({ documentId }) {
  if (!documentId) return <small>Link de download indisponível.</small>;

  const handleDownload = async () => {
    try {
      // Busca o arquivo como blob
      const blob = await api.downloadDocumentById(documentId);

      // Busca metadados para obter o nome original
      const metadata = await api.downloadDocumentById(documentId);
      const fileName = metadata.filename || "Documento_TPF-AI.pdf";

      // Cria link temporário para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar documento:", error);
      alert("Falha ao baixar o documento.");
    }
  };

  return (
    <button onClick={handleDownload} className="document-download-link">
      <FaDownload style={{ marginRight: "5px" }} />
      Baixar documento
    </button>
  );
}
