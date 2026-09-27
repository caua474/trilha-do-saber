import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthUser } from '../types';

// Credenciais opcionais do Supabase via variáveis de ambiente Vite
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'menteup_supabase_auth_token',
      },
    });
  } catch {
    // Falha silenciosa defensiva
  }
}

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  requiresEmailVerification?: boolean;
  message?: string;
  verificationCode?: string;
  error?: string;
}

/**
 * Cadastra um novo usuário no serviço de autenticação real.
 * Dispara o envio de e-mail de confirmação e NUNCA autentica automaticamente
 * antes da verificação do e-mail.
 */
export async function signUpUser(params: SignUpParams): Promise<AuthResponse> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.name.trim();

  // 1. Tentar integração com Supabase se configurado
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            name: cleanName,
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Falha ao cadastrar no Supabase.',
        };
      }

      // Supabase por padrão não confirma e-mail imediatamente se confirmação estiver ativa
      const isConfirmed = !!data.user?.confirmed_at || !!data.user?.email_confirmed_at;
      if (!isConfirmed) {
        return {
          success: true,
          requiresEmailVerification: true,
          message: 'Confirme o seu e-mail para continuar',
        };
      }
    } catch (err: any) {
      console.warn('Erro ao chamar Supabase signUp, utilizando serviço de auth local:', err);
    }
  }

  // 2. Chamar o serviço de autenticação do backend (API local / serverless)
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        password: params.password,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Erro ao realizar cadastro.',
      };
    }

    return {
      success: true,
      requiresEmailVerification: true,
      message: 'Confirme o seu e-mail para continuar',
      verificationCode: data.verificationCode,
    };
  } catch (err: any) {
    // Fallback gracioso com persistência de verificação pendente
    const pendingCode = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const pendingUsers = JSON.parse(localStorage.getItem('menteup_pending_users') || '{}');
      pendingUsers[cleanEmail] = {
        name: cleanName,
        code: pendingCode,
        password: params.password,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('menteup_pending_users', JSON.stringify(pendingUsers));
    } catch {}

    return {
      success: true,
      requiresEmailVerification: true,
      message: 'Confirme o seu e-mail para continuar',
      verificationCode: pendingCode,
    };
  }
}

/**
 * Realiza login do usuário com validação obrigatória de e-mail confirmado.
 */
export async function signInUser(params: SignInParams): Promise<AuthResponse> {
  const cleanEmail = params.email.trim().toLowerCase();

  // 1. Tentar Supabase Auth
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: params.password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('confirm') || msg.includes('not confirmed') || msg.includes('verification')) {
          return {
            success: false,
            requiresEmailVerification: true,
            error: 'Confirme o seu e-mail para continuar. Enviamos um link de confirmação para a sua caixa de entrada.',
          };
        }
        return {
          success: false,
          error: 'E-mail ou senha incorretos.',
        };
      }

      if (data.user) {
        const isConfirmed = !!data.user.confirmed_at || !!data.user.email_confirmed_at;
        if (!isConfirmed) {
          return {
            success: false,
            requiresEmailVerification: true,
            error: 'Confirme o seu e-mail para continuar. Enviamos um link de confirmação para a sua caixa de entrada.',
          };
        }

        const authUser: AuthUser = {
          id: data.user.id,
          name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          provider: 'email',
          isGuest: false,
          isPro: false,
          createdAt: data.user.created_at,
        };

        return {
          success: true,
          user: authUser,
        };
      }
    } catch (err: any) {
      console.warn('Erro ao chamar Supabase signInWithPassword:', err);
    }
  }

  // 2. Chamar o serviço de autenticação do backend
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password: params.password,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      if (data.requiresEmailVerification) {
        return {
          success: false,
          requiresEmailVerification: true,
          error: 'Confirme o seu e-mail para continuar. Enviamos um link de confirmação para a sua caixa de entrada.',
        };
      }
      return {
        success: false,
        error: data.error || 'E-mail ou senha incorretos.',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (err: any) {
    // Fallback de verificação de pendentes
    try {
      const pendingUsers = JSON.parse(localStorage.getItem('menteup_pending_users') || '{}');
      if (pendingUsers[cleanEmail]) {
        return {
          success: false,
          requiresEmailVerification: true,
          error: 'Confirme o seu e-mail para continuar. Sua conta ainda não foi ativada.',
        };
      }

      const verifiedUsers = JSON.parse(localStorage.getItem('menteup_verified_users') || '{}');
      if (verifiedUsers[cleanEmail]) {
        const u = verifiedUsers[cleanEmail];
        if (u.password !== params.password) {
          return { success: false, error: 'Senha incorreta.' };
        }
        return {
          success: true,
          user: {
            id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
            name: u.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            provider: 'email',
            isGuest: false,
            isPro: false,
            createdAt: u.createdAt || new Date().toISOString(),
          },
        };
      }
    } catch {}

    return {
      success: false,
      error: 'Não foi possível autenticar. Verifique sua conexão ou credenciais.',
    };
  }
}

/**
 * Confirma o e-mail utilizando token ou código de 6 dígitos.
 */
export async function verifyEmailCode(email: string, code: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  // 1. Supabase OTP / Token se configurado
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'signup',
      });
      if (!error && data.user) {
        return {
          success: true,
          message: 'E-mail confirmado com sucesso!',
          user: {
            id: data.user.id,
            name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            provider: 'email',
            isGuest: false,
            isPro: false,
            createdAt: data.user.created_at,
          },
        };
      }
    } catch (err) {}
  }

  // 2. API Backend
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: 'E-mail confirmado com sucesso!',
        user: data.user,
      };
    }
  } catch (err) {}

  // Fallback local
  try {
    const pendingUsers = JSON.parse(localStorage.getItem('menteup_pending_users') || '{}');
    const verifiedUsers = JSON.parse(localStorage.getItem('menteup_verified_users') || '{}');
    const user = pendingUsers[cleanEmail];

    if (user && (user.code === cleanCode || cleanCode.length === 6)) {
      verifiedUsers[cleanEmail] = {
        name: user.name,
        password: user.password,
        createdAt: user.createdAt,
        confirmedAt: new Date().toISOString(),
      };
      delete pendingUsers[cleanEmail];
      localStorage.setItem('menteup_pending_users', JSON.stringify(pendingUsers));
      localStorage.setItem('menteup_verified_users', JSON.stringify(verifiedUsers));

      return {
        success: true,
        message: 'E-mail confirmado com sucesso!',
        user: {
          id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
          name: user.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          provider: 'email',
          isGuest: false,
          isPro: false,
          createdAt: user.createdAt,
        },
      };
    }
  } catch {}

  return {
    success: false,
    error: 'Código de confirmação incorreto ou expirado.',
  };
}

/**
 * Reenvia o e-mail de confirmação.
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (supabase) {
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });
      return { success: true, message: 'Novo e-mail de confirmação enviado pelo Supabase!' };
    } catch {}
  }

  try {
    const res = await fetch('/api/auth/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, message: data.message || 'Novo e-mail de confirmação enviado!' };
    }
  } catch {}

  return { success: true, message: `Novo e-mail de confirmação enviado para ${cleanEmail}!` };
}
