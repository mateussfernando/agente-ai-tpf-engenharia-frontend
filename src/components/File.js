// components/FileAttachment.js
import React from "react";
import { MdClose, MdDescription } from "react-icons/md";
import "../style/file.css";

export default function FileAttachment({ 
  documentId, 
  fileName, 
  onRemove,
  showRemove = true 
}) {
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div className="file">
      <div className="file-info">
        <MdDescription className="file-icon" />
        <span className="file-name" title={fileName}>
          {fileName || `Documento ${documentId?.substring(0, 8)}`}
        </span>
      </div>
      
      {showRemove && (
        <button 
          className="remove-file-btn"
          onClick={handleRemove}
          title="Remover arquivo"
        >
          <MdClose />
        </button>
      )}
    </div>
  );
}