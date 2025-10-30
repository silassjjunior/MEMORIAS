// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // LOGIN
  const signInWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        let message = 'Erro ao fazer login.';
        if (error.message.includes('Email not confirmed')) {
          message = 'Por favor, confirme seu e-mail antes de entrar.';
        } else if (error.message.includes('Invalid login credentials')) {
          message = 'E-mail ou senha incorretos.';
        }
        return { success: false, message };
      }

      if (!data?.user) {
        return { success: false, message: 'Usuário não encontrado.' };
      }

      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  // CADASTRO
  const signUpWithEmail = async (email, password, userData = {}) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: userData.username, avatar_url: userData.avatar_url || '' } },
    });
    setLoading(false);

    if (error) return { success: false, message: error.message };

    const user = data?.user;
    if (user) {
      await supabase.from('Users').insert([{
        id: user.id,
        email: user.email,
        username: userData.username || user.email.split('@')[0],
        avatar_url: userData.avatar_url || '',
        created_at: new Date(),
        updated_at: new Date(),
      }]);
    }

    return { success: true };
  };

  // LOGOUT
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      setUser
    }}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </AuthContext.Provider>
  );
};
