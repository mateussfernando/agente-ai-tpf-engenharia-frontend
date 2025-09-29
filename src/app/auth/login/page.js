"use client";
import AuthLayout from "@/components/AuthLayout.js";
import Input from "../../../components/Input.js";
import AuthButton from "@/components/AuthButton.js";
import AuthSubtitle from "@/components/AuthSubtitle.js";
import AlertBox from "@/components/AlertBox.js";
import { FiUser, FiLock } from "react-icons/fi";

export default function LoginPage() {
  return (
    <AuthLayout>
      <AlertBox type="success">
        Para continuar, efetue o login ou registre-se
      </AlertBox>
      <AuthSubtitle>Faça login para continuar</AuthSubtitle>{" "}
      <Input
        name="E-mail"
        type="email"
        placeholder="E-mail"
        icon={<FiUser className="text-black/25" size={18} />}
      />
      <Input
        name="Senha"
        placeholder="Senha"
        icon={<FiLock className="text-black/25" size={18} />}
        showPasswordToggle={true}
      />
      {/* Forgot password link */}
      <div className="w-full text-right mb-4">
        <a
          href="/auth/forgot-password/verify-email"
          className="text-gray-400 text-sm hover:text-gray-600"
        >
          Esqueceu a senha?
        </a>
      </div>
      <AuthButton onClick={() => alert("Login clicked!")}>Entrar</AuthButton>
      {/* Register link */}
      <p className="text-gray-400 text-sm text-center mt-6">
        Não possui cadastro?{" "}
        <a
          href="/auth/register/form"
          className="text-gray-600 hover:text-gray-800"
        >
          Faça uma conta aqui
        </a>
      </p>
    </AuthLayout>
  );
}
