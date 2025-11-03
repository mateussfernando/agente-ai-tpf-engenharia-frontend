import React from "react";
import { api } from "../../../api/Api";
import "../../style/menu-perfil.css";

export default function MenuPerfil({ userEmail }) {
  function handleLogout() {
    api.logout();
  }

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
