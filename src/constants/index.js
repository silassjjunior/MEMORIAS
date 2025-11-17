// Constantes da aplicação MEMORIAS

import CadastroPage from "@/pages/CadastroPage"
import FeedEvento from "@/pages/FeedEvento"
import SuasMemorias from "@/pages/SuasMemorias"

// Configurações da aplicação
export const APP_CONFIG = {
  name: 'MEMORIAS',
  tagline: 'Todas as suas memórias juntas em um só lugar',
  description: 'Plataforma digital inovadora que transforma eventos e experiências em memórias digitais exclusivas e colecionáveis.',
  version: '1.0.0'
}

// URLs e endpoints
export const URLS = {
  home: '/',
  login: '/login',
  LandingPage: '/LandingPage',
  dashboard: '/dashboard',
  NovaChave: '/NovaChave',
  NovoEvento: '/NovoEvento', 
  trophies: '/trophies',
  memories: '/memories',
  marketplace: '/marketplace',
  profile: '/profile',
  authCallback: '/auth/callback',
  AddImagens: '/AddImagens',
  MinhasMemorias: '/MinhasMemorias',
  FeedEvento: '/FeedEvento',
  FeedGeral: '/FeedGeral',
  CompartilharPage: '/CompartilharPage',
  EditarFeed: '/EditarFeed',
  CadastroPage: '/cadastro',
  CuradoriaPage: '/CuradoriaPage',
  SuasMemorias: '/SuasMemorias',
  AdminPecasPage: '/AdminPecasPage',
  LojaPecasPage: '/LojaPecasPage'
}

// Tipos de eventos
export const EVENT_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  UNLISTED: 'unlisted'
}

// Tipos de memórias
export const MEMORY_PRIVACY = {
  PRIVATE: 'private',
  SHARED: 'shared'
}

export const MEMORY_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video'
}

// Status do marketplace
export const MARKETPLACE_STATUS = {
  ACTIVE: 'active',
  SOLD: 'sold',
  CANCELLED: 'cancelled'
}

// Provedores de autenticação
export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  APPLE: 'apple'
}

// Tipos de notificação
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Configurações de upload
export const UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/mov'],
  maxFiles: 10
}

// Cores do tema (baseadas no protótipo)
export const THEME_COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e'
  },
  secondary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843'
  },
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12'
  }
}

// Textos da aplicação
export const TEXTS = {
  auth: {
    loginTitle: 'Entre na sua conta',
    loginSubtitle: 'Acesse suas memórias e troféus digitais',
    signupTitle: 'Crie sua conta',
    signupSubtitle: 'Comece a colecionar suas memórias digitais',
    continueWithGoogle: 'Continuar com Google',
    continueWithFacebook: 'Continuar com Facebook',
    continueWithApple: 'Continuar com Apple',
    orDivider: 'ou',
    emailPlaceholder: 'Digite seu e-mail',
    passwordPlaceholder: 'Digite sua senha',
    loginButton: 'Entrar',
    signupButton: 'Criar conta',
    forgotPassword: 'Esqueceu sua senha?',
    noAccount: 'Não tem uma conta?',
    hasAccount: 'Já tem uma conta?',
    signupLink: 'Cadastre-se',
    loginLink: 'Faça login'
  },
  dashboard: {
    welcome: 'Bem-vindo ao MEMORIAS',
    recentMemories: 'Memórias Recentes',
    myTrophies: 'Meus Troféus',
    myEvents: 'Meus Eventos',
    createEvent: 'Criar Novo Evento',
    noEvents: 'Você ainda não criou nenhum evento',
    noTrophies: 'Você ainda não possui nenhum troféu',
    noMemories: 'Nenhuma memória encontrada'
  },
  NovoEvento: {
    createTitle: 'Criar Novo Evento',
    eventName: 'Nome do Evento',
    eventDescription: 'Descrição do Evento',
    eventDate: 'Data do Evento',
    eventVisibility: 'Visibilidade',
    coverImage: 'Imagem de Capa',
    createButton: 'Criar Evento',
    editButton: 'Editar Evento',
    deleteButton: 'Excluir Evento'
  },
  memories: {
    uploadTitle: 'Fazer Upload de Memórias',
    selectFiles: 'Selecionar Arquivos',
    dragDrop: 'Arraste e solte arquivos aqui',
    privacy: 'Privacidade',
    description: 'Descrição (opcional)',
    uploadButton: 'Fazer Upload',
    privateLabel: 'Privada (só você vê)',
    sharedLabel: 'Compartilhada (outros donos do troféu podem ver)'
  },
  marketplace: {
    title: 'Marketplace de Troféus',
    buyButton: 'Comprar',
    sellButton: 'Vender',
    price: 'Preço',
    seller: 'Vendedor',
    listedAt: 'Listado em',
    noListings: 'Nenhum troféu à venda no momento'
  }
}

// Configurações de animação
export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
  }
}

// Breakpoints responsivos
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}
