import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ifpcahwsvbmbgyzfrlbw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcGNhaHdzdmJtYmd5emZybGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTIxNTMsImV4cCI6MjA3NDcyODE1M30.MhxsuqnCNLf_5HEGhbomfgbHejDpkcQoLTKbkdw8KM8'

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Função para verificar se o usuário está autenticado
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Erro ao obter usuário:', error.message)
    return null
  }
  return user
}

// Função para fazer logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Erro ao fazer logout:', error.message)
    return false
  }
  return true
}

// Função para login com provedor OAuth
export const signInWithProvider = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  
  if (error) {
    console.error(`Erro ao fazer login com ${provider}:`, error.message)
    return { success: false, error }
  }
  
  return { success: true, data }
}

// Função para login com email e senha
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    console.error('Erro ao fazer login:', error.message)
    return { success: false, error }
  }
  
  return { success: true, data }
}

// Função para registro com email e senha
export const signUpWithEmail = async (email, password, userData = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  
  if (error) {
    console.error('Erro ao criar conta:', error.message)
    return { success: false, error }
  }
  
  return { success: true, data }
}

export default supabase
