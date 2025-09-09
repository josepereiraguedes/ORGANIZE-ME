import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        const result = await signUp(email, password);
        if (result.data?.user) {
          // Verificar se o usuário já está confirmado ou se precisa confirmar pelo email
          if (result.data.user.identities?.length === 0) {
            toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
          } else {
            toast.success('Conta criada com sucesso!');
          }
        }
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error('Erro na autenticação:', error);
      // Tratar mensagens de erro específicas
      if (error.message.includes('Email not confirmed')) {
        toast.error('Por favor, verifique seu email e confirme sua conta antes de fazer login.');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos.');
      } else if (error.message.includes('For security purposes, you can only request this after')) {
        // Extrair o tempo de espera da mensagem de erro
        const match = error.message.match(/after (\d+) seconds/);
        const seconds = match ? match[1] : 'alguns';
        toast.error(`Por segurança, você precisa esperar ${seconds} segundos antes de tentar novamente.`);
      } else {
        toast.error(error.message || 'Erro na autenticação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para validar o formulário
  const validateForm = () => {
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos.');
      return false;
    }
    
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, insira um email válido.');
      return false;
    }
    
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await handleSubmit(e);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isSignUp ? 'Criar conta' : 'Entrar no sistema'}
          </h2>
          {isSignUp && (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Após criar a conta, você receberá um email de confirmação.
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleFormSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Senha"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </div>
              ) : isSignUp ? (
                'Criar conta'
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              // Limpar campos ao alternar entre login e cadastro
              setEmail('');
              setPassword('');
            }}
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Criar conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;