'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout.js';
import Input from '../../../../components/auth/AuthInput.js';
import AuthButton from '@/components/auth/AuthButton.js';
import AuthSubtitle from '@/components/auth/AuthSubtitle.js';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { api } from '@/api/Api.js';

export default function Form() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro específico quando o usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  }

  function validateForm() {
    const newErrors = {};

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome completo é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Formato de email inválido';
      }
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await api.register(formData.name, formData.email, formData.password);
      router.push('/auth/register/success');
    } catch (error) {
      console.error('Erro no registro:', error);

      // Verificar se é erro de email já em uso
      if (
        error.message.includes('409') ||
        error.message.includes('já está em uso')
      ) {
        setErrors({
          email: 'Este email já está em uso. Tente outro email ou faça login.',
        });
      } else {
        setErrors({
          submit: error.message || 'Erro ao criar conta. Tente novamente.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthSubtitle>Crie sua conta aqui</AuthSubtitle>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div>
          <Input
            name="Nome"
            type="text"
            placeholder="Digite seu nome completo"
            icon={<FiUser className="text-black/25" size={18} />}
            value={formData.name}
            onChange={(e) =>
              handleInputChange({
                ...e,
                target: { ...e.target, name: 'name' },
              })
            }
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Input
            name="E-mail"
            type="email"
            placeholder="Digite o seu email"
            icon={<FiMail className="text-black/25" size={18} />}
            value={formData.email}
            onChange={(e) =>
              handleInputChange({
                ...e,
                target: { ...e.target, name: 'email' },
              })
            }
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Input
            name="Senha"
            placeholder="Digite sua senha"
            icon={<FiLock className="text-black/25" size={18} />}
            showPasswordToggle={true}
            value={formData.password}
            onChange={(e) =>
              handleInputChange({
                ...e,
                target: { ...e.target, name: 'password' },
              })
            }
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <Input
            name="Confirmar senha"
            placeholder="Confirme sua senha"
            icon={<FiLock className="text-black/25" size={18} />}
            showPasswordToggle={true}
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange({
                ...e,
                target: { ...e.target, name: 'confirmPassword' },
              })
            }
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </AuthButton>
      </form>

      {/* Login link */}
      <p className="text-gray-400 text-sm text-center mt-6">
        Já possui conta?{' '}
        <a href="/auth/login" className="text-gray-600 hover:text-gray-800">
          Faça seu login aqui
        </a>
      </p>
    </AuthLayout>
  );
}
