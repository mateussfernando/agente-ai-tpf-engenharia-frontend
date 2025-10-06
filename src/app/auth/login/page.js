"use client";
import { useState } from "react";
import AuthLayout from "@/components/layout/AuthLayout.js";
import Input from "../../../components/ui/Input.js";
import AuthButton from "@/components/ui/AuthButton.js";
import AuthSubtitle from "@/components/ui/AuthSubtitle.js";
import AlertBox from "@/components/modals/AlertBox.js";
import { FiUser, FiLock } from "react-icons/fi";
import { api } from "../../../api/Api.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.login(email, password);

      // Salva o token correto
      localStorage.setItem("token", data.access_token);

      window.location.href = "/chat";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {error && <AlertBox type="error">{error}</AlertBox>}
      {!error && (
        <AlertBox type="success">
          Para continuar, efetue o login ou registre-se
        </AlertBox>
      )}

      <AuthSubtitle>Faça login para continuar</AuthSubtitle>

      <Input
        name="E-mail"
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<FiUser className="text-black/25" size={18} />}
      />

      <Input
        name="Senha"
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<FiLock className="text-black/25" size={18} />}
        showPasswordToggle={true}
      />

      <div className="w-full text-right mb-4">
        <a
          href="/auth/forgot-password/verify-email"
          className="text-gray-400 text-sm hover:text-gray-600"
        >
          Esqueceu a senha?
        </a>
      </div>

      <AuthButton onClick={handleLogin} disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </AuthButton>

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
