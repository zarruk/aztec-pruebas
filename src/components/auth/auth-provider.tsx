'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { Session, User } from '@supabase/supabase-js';
import { SITE_URL } from '@/lib/auth-config';

// Lista de correos autorizados
const ALLOWED_EMAILS = ['martin@azteclab.co', 'salomon@azteclab.co'];

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  signInWithPassword: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Registrar la URL del sitio para depuración
    console.log('AuthProvider: URL del sitio configurada como', SITE_URL);
    
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Suscribirse a cambios en la autenticación
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }

    loadUserData();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const signInWithPassword = async (email: string, password: string) => {
    // Verificar si el correo está autorizado
    if (!ALLOWED_EMAILS.includes(email)) {
      return { error: new Error('Correo electrónico no autorizado. Solo usuarios específicos pueden acceder al sistema.') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.push('/dashboard');
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Verificar si el correo está autorizado
    if (!ALLOWED_EMAILS.includes(email)) {
      return { error: new Error('Correo electrónico no autorizado. Solo usuarios específicos pueden crear cuentas.') };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { error };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signOut,
      signInWithPassword,
      signUp
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 