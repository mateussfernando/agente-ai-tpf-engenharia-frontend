import React from "react";
import "../../style/attachment-chips.css";

export default function AttachmentChips({
  templates = [], // Array de {id, name, instructions}
  files = [], // Array de {id, name}
  onRemoveTemplate,
  onRemoveFile,
}) {
  // Não renderiza nada se não houver anexos
  if (templates.length === 0 && files.length === 0) {
    return null;
  }

  return (
    <div className="attachments-chips">
      {/* Chips de templates */}
      {templates.map((template) => (
        <div key={template.id} className="template-chip">
          <span className="chip-icon">📄</span>
          <span className="chip-label">{template.name}</span>
          <button
            className="chip-remove"
            onClick={() => onRemoveTemplate(template.id)}
            title="Remover template"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Chips de arquivos anexados */}
      {files.map((file) => (
        <div key={file.id} className="file-chip">
          <span className="chip-icon">📎</span>
          <span className="chip-label">{file.name}</span>
          <button
            className="chip-remove"
            onClick={() => onRemoveFile(file.id)}
            title="Remover arquivo"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
