import React, { useState, useEffect, useRef } from "react";
import "../style/modal.css";

export default function Modal({ type, chatTitle, onClose, onConfirm }) {
  const [newTitle, setNewTitle] = useState(chatTitle || "");
  const inputRef = useRef(null);
  const isRename = type === "renomear";
  const isDelete = type === "excluir";

  useEffect(() => {
    if (isRename) inputRef.current?.focus();

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isRename, onClose]);

  const handleConfirm = () => {
    if (isRename && !newTitle.trim()) return;
    onConfirm(isRename ? newTitle.trim() : undefined);
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-animate" role="dialog" aria-modal="true">
        {isDelete && <p>Deseja realmente excluir o chat "{chatTitle}"?</p>}
        {isRename && (
          <>
            <p>Renomear chat:</p>
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleConfirm()}
              maxLength={50}
            />
          </>
        )}
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button
            className="confirm"
            onClick={handleConfirm}
            disabled={isRename && !newTitle.trim()}
          >
            {isDelete ? "Confirmar Exclusão" : "Salvar Novo Nome"}
          </button>
        </div>
      </div>
    </div>
  );
}
