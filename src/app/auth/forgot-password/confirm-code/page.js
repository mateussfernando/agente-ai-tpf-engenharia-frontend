"use client";
import AuthLayout from "@/components/AuthLayout.js";
import AuthButton from "@/components/AuthButton.js";
import AuthSubtitle from "@/components/AuthSubtitle.js";

export default function ConfirmCode() {
  return (
    <AuthLayout>
      <AuthSubtitle>
        Insira o código de verificação recebido no e-mail informado.
      </AuthSubtitle>

      {/* Code input boxes */}
      <div className="flex gap-3 mb-6">
        {[1, 2, 3, 4].map((index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            className="w-12 h-12 text-center text-lg border border-black/25 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        ))}
      </div>

      <AuthButton
        onClick={() => (window.location.href = "/auth/forgot-password/success")}
      >
        Confirmar
      </AuthButton>
    </AuthLayout>
  );
}
