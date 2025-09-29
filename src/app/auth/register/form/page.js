"use client";
import AuthLayout from "@/components/AuthLayout.js";
import Input from "../../../../components/Input.js";
import AuthButton from "@/components/AuthButton.js";
import AuthSubtitle from "@/components/AuthSubtitle.js";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

export default function Form() {
  return (
    <AuthLayout>
      <AuthSubtitle>Crie sua conta aqui</AuthSubtitle>

      <Input
        name="Nome completo"
        type="text"
        placeholder="Digite seu nome completo"
        icon={<FiUser className="text-black/25" size={18} />}
      />

      <Input
        name="E-mail"
        type="email"
        placeholder="Digite o seu email"
        icon={<FiMail className="text-black/25" size={18} />}
      />

      <Input
        name="Senha"
        placeholder="Digite sua senha"
        icon={<FiLock className="text-black/25" size={18} />}
        showPasswordToggle={true}
      />

      <Input
        name="Confirmação da Senha"
        placeholder="Confirme sua senha"
        icon={<FiLock className="text-black/25" size={18} />}
        showPasswordToggle={true}
      />

      <AuthButton
        onClick={() => (window.location.href = "/auth/register/success")}
      >
        Cadastrar
      </AuthButton>

      {/* Login link */}
      <p className="text-gray-400 text-sm text-center mt-6">
        Já possui conta?{" "}
        <a href="/auth/login" className="text-gray-600 hover:text-gray-800">
          Faça seu login aqui
        </a>
      </p>
    </AuthLayout>
  );
}
