import React, { useState, useEffect } from 'react';
import { api } from '../api/Api';
import { FaDownload } from 'react-icons/fa';

/Area para baixar / 
export default function DocumentLink({ documentId }) {
    const [gridfsId, setGridfsId] = useState(null);
    const [fileName, setFileName] = useState("Documento Gerado");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFileMetadata = async () => {
            if (!documentId) return;

            try {
                const metadata = await api.getDocumentMetadata(documentId);
                setGridfsId(metadata.gridfs_file_id);
                setFileName(metadata.filename || "Documento Gerado");
            } catch (error) {
                console.error("Erro ao buscar metadados do arquivo:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFileMetadata();
    }, [documentId]);

    if (isLoading) {
        return <small>Carregando link do documento...</small>;
    }

    if (!gridfsId) {
        return <small>Link de download indisponível.</small>;
    }

    return (
        <a
            href={`${api.API_BASE_URL}/api/files/${gridfsId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="document-download-link"
        >
            <FaDownload /> Baixar: {fileName}
        </a>
    );
}