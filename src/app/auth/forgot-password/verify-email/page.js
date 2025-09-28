"use client";
import AuthLayout from "@/components/AuthLayout.js";
import Input from "../../../../components/Input.js";
import AuthButton from "@/components/AuthButton.js";
import AuthSubtitle from "@/components/AuthSubtitle.js";
import { FiMail } from "react-icons/fi";

export default function VerifyEmail() {
  return (
    <AuthLayout>
      <AuthSubtitle>
        Informe seu e-mail. Se ele estiver cadastrado, enviaremos um código de
        verificação para sua caixa de entrada.
      </AuthSubtitle>

      <Input
        name="E-mail"
        type="email"
        placeholder="Digite o seu email"
        icon={<FiMail className="text-black/25" size={18} />}
      />

      <AuthButton
        onClick={() =>
          (window.location.href = "/auth/forgot-password/confirm-code")
        }
      >
        Enviar
      </AuthButton>
    </AuthLayout>
  );
}
