import React, { useState } from "react";
import { FiEdit, FiTrash2, FiMoreVertical } from "react-icons/fi";
import "../style/side-bar-Item.css";

export default function SidebarItem({
  chatId,
  text,
  onRename,
  onDelete,
  onSelect,
  isActive,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = (e) => {
    e.stopPropagation();
    onRename?.(chatId, text);
    setShowMenu(false);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(chatId, text);
    setShowMenu(false);
  };

  return (
    <div
      className={`sidebar-item ${isActive ? "active" : ""}`}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      onClick={() => onSelect?.(chatId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.(chatId)}
    >
      <span className="sidebar-text">{text}</span>
      <div className="dots-menu">
        <div className={`dropdown ${showMenu ? "show" : ""}`}>
          <p
            onClick={handleRename}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && handleRename(e)
            }
          >
            <FiEdit className="icon" /> Renomear
          </p>
          <p
            onClick={handleDelete}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && handleDelete(e)
            }
          >
            <FiTrash className="icon" /> Excluir
          </p>
        </div>
      </div>
    </div>
  );
}
