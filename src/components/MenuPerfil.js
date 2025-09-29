import React from "react";
import "../style/menu-perfil.css";

export default function MenuPerfil({ onLogout, userEmail }) {
  const handleLogout = () => {
    if (typeof onLogout === "function") onLogout();
  };

  return (
    <div className="profile-menu">
      <div className="profile-info">
        <span>{userEmail}</span>
      </div>
      <button className="profile-option" onClick={handleLogout} type="button">
        <span>Sair</span>
      </button>
    </div>
  );
}
