import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "../style/side-bar-Item.css";

export default function SidebarItem({
  conversation,
  onRename,
  onDelete,
  onSelect,
  isActive,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null); // referência do botão "⋮"
  const menuRef = useRef(null); // referência do dropdown (portal)

  const openMenu = (e) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,   // posição no documento
        left: rect.right + 12,            // à direita da sidebar
      });
    }
    setShowMenu(true);
  };

  const closeMenu = () => setShowMenu(false);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (showMenu) closeMenu();
    else openMenu(e);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    // opcional: console.log para debug
    // console.log("clicou renomear", conversation);
    onRename?.(conversation);
    closeMenu();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    // console.log("clicou excluir", conversation);
    onDelete?.(conversation);
    closeMenu();
  };

  // Fecha ao clicar fora OU tocar (considera menuRef + buttonRef)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      // se não está nem no botão nem no menu, fechar
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setShowMenu(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setShowMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Atualiza posição se a janela rolar ou redimensionar enquanto o menu está aberto
  useEffect(() => {
    if (!showMenu) return;
    const updatePos = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.right + 12,
      });
    };
    window.addEventListener("scroll", updatePos, { passive: true });
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos);
      window.removeEventListener("resize", updatePos);
    };
  }, [showMenu]);

  return (
    <>
      <div
        className={`sidebar-item ${isActive ? "active" : ""}`}
        onClick={() => onSelect?.(conversation)}
      >
        <span className="sidebar-text">
          {conversation.title || "Chat sem nome"}
        </span>

        {/* botão que abre o menu */}
        <div
          className="dots-menu"
          ref={buttonRef}
          onClick={toggleMenu}
          role="button"
          aria-haspopup="menu"
          aria-expanded={showMenu}
        >
          <span className="dots">⋮</span>
        </div>
      </div>

      {/* portal do dropdown - menuRef permite detectar cliques dentro dele */}
      {showMenu &&
        createPortal(
          <div
            className="floating-dropdown"
            ref={menuRef}
            style={{
              position: "absolute",
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 99999,
            }}
            role="menu"
          >
            <p
              onClick={handleRename}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && handleRename(e)
              }
            >
              <FiEdit className="icon" /> Renomear
            </p>
            <p
              onClick={handleDelete}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && handleDelete(e)
              }
            >
              <FiTrash2 className="icon" /> Excluir
            </p>
          </div>,
          document.body
        )}
    </>
  );
}
