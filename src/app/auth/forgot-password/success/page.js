"use client";
import AuthLayout from "@/components/AuthLayout.js";
import AuthButton from "@/components/AuthButton.js";
import AlertBox from "@/components/AlertBox.js";

export default function Success() {
  return (
    <AuthLayout>
      <AlertBox type="success">
        Sua senha foi alterada com sucesso. Por favor, faça login novamente para
        continuar.
      </AlertBox>

      <AuthButton onClick={() => (window.location.href = "/auth/login")}>
        Voltar para o início
      </AuthButton>
    </AuthLayout>
  );
}
