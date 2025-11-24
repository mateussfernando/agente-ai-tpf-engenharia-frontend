'use client';
import AuthLayout from '@/components/auth/AuthLayout.js';
import AuthButton from '@/components/auth/AuthButton.js';
import AlertBox from '@/components/auth/AlertBox.js';

export default function Success() {
  return (
    <AuthLayout>
      <AlertBox type="success">
        Seu cadastro foi concluído com sucesso. Faça login para acessar.
      </AlertBox>

      <AuthButton onClick={() => (window.location.href = '/auth/login')}>
        Voltar para o início
      </AuthButton>
    </AuthLayout>
  );
}
