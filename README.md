# MEMORIAS - Frontend

**Plataforma digital inovadora que transforma eventos e experiências em memórias digitais exclusivas e colecionáveis.**

## 📋 Visão Geral

O MEMORIAS é uma aplicação web moderna desenvolvida em React que permite aos usuários criar eventos, colecionar troféus digitais únicos e preservar memórias através de fotos e vídeos. A plataforma oferece uma experiência gamificada onde cada evento gera troféus NFT-like que podem ser colecionados, compartilhados e até mesmo comercializados.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19.1.0** - Biblioteca principal para construção da interface
- **Vite** - Build tool e servidor de desenvolvimento
- **React Router DOM** - Roteamento client-side
- **Tailwind CSS** - Framework CSS utilitário para estilização
- **shadcn/ui** - Biblioteca de componentes UI modernos
- **Lucide React** - Ícones SVG otimizados

### Backend & Infraestrutura
- **Supabase** - Backend-as-a-Service (BaaS)
  - Banco de dados PostgreSQL
  - Autenticação OAuth (Google, Facebook, Apple)
  - Storage para arquivos de mídia
  - Row Level Security (RLS)

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código JavaScript/React
- **PostCSS** - Processamento de CSS
- **pnpm** - Gerenciador de pacotes

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── Navigation.jsx  # Navegação principal
│   ├── TrophyCard.jsx  # Card de troféu
│   ├── EventCard.jsx   # Card de evento
│   ├── MemoryCard.jsx  # Card de memória
│   ├── MemoryUpload.jsx # Upload de memórias
│   └── AuthForm.jsx    # Formulário de autenticação
├── contexts/           # Contextos React
│   ├── AuthContext.jsx # Contexto de autenticação
│   └── AppContext.jsx  # Contexto global da aplicação
├── pages/              # Páginas da aplicação
│   ├── LoginPage.jsx   # Página de login/cadastro
│   ├── DashboardPage.jsx # Dashboard principal
│   └── TrophiesPage.jsx # Página de troféus
├── lib/                # Bibliotecas e configurações
│   └── supabase.js     # Cliente Supabase
├── utils/              # Funções utilitárias
├── constants/          # Constantes da aplicação
├── types/              # Definições de tipos (JSDoc)
└── assets/             # Recursos estáticos
```

### Padrões de Design

**Atomic Design**: Os componentes são organizados seguindo a metodologia Atomic Design, promovendo reutilização e escalabilidade.

**Component Composition**: Utilização de composição de componentes para criar interfaces flexíveis e modulares.

**Context Pattern**: Gerenciamento de estado global através de React Context API para autenticação e dados da aplicação.

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado) ou npm

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd memorias-frontend
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Inicie o servidor de desenvolvimento**
```bash
pnpm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🎨 Design System

### Cores Principais
- **Primária**: Gradiente azul-roxo (#3B82F6 → #8B5CF6)
- **Secundária**: Rosa (#EC4899)
- **Accent**: Amarelo (#EAB308)
- **Neutras**: Escala de cinzas

### Tipografia
- **Fonte**: Inter (sistema padrão)
- **Hierarquia**: h1-h6 com tamanhos responsivos
- **Peso**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Componentes UI
Todos os componentes seguem o design system do shadcn/ui com customizações para o tema MEMORIAS:
- Botões com estados hover e focus
- Cards com sombras suaves
- Inputs com validação visual
- Modais e overlays
- Navegação responsiva

## 🔐 Autenticação e Segurança

### Provedores de Autenticação
- **Google OAuth** - Login social principal
- **Facebook OAuth** - Login social alternativo  
- **Apple OAuth** - Para usuários iOS/macOS
- **Email/Senha** - Autenticação tradicional

### Segurança
- **Row Level Security (RLS)** no Supabase
- **Validação client-side** com feedback visual
- **Sanitização de dados** antes do envio
- **Proteção de rotas** com componente ProtectedRoute

## 📱 Responsividade

A aplicação é totalmente responsiva com breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

### Estratégias Mobile-First
- Layout flexível com CSS Grid e Flexbox
- Navegação adaptativa (bottom tabs no mobile)
- Componentes que se adaptam ao tamanho da tela
- Otimização de performance para dispositivos móveis

## 🚀 Performance

### Otimizações Implementadas
- **Code Splitting** automático com React Router
- **Lazy Loading** de imagens e componentes
- **Memoização** de componentes pesados
- **Debounce** em campos de busca
- **Compressão** de imagens no upload

### Métricas de Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🧪 Testes

### Estratégia de Testes
- **Testes Unitários**: Componentes isolados
- **Testes de Integração**: Fluxos completos
- **Testes E2E**: Cenários críticos de usuário

### Ferramentas (a implementar)
- Jest + React Testing Library
- Cypress para testes E2E
- Storybook para documentação de componentes

## 📦 Build e Deploy

### Scripts Disponíveis
```bash
pnpm run dev          # Servidor de desenvolvimento
pnpm run build        # Build de produção
pnpm run preview      # Preview do build
pnpm run lint         # Verificação de código
```

### Deploy
A aplicação pode ser deployada em qualquer plataforma que suporte aplicações React:
- **Vercel** (recomendado)
- **Netlify**
- **AWS S3 + CloudFront**
- **Firebase Hosting**

## 🔄 Integração com Backend

### Supabase Integration
- **Database**: PostgreSQL com esquema otimizado
- **Storage**: Bucket para arquivos de mídia
- **Auth**: Gerenciamento completo de usuários
- **Real-time**: Subscriptions para atualizações em tempo real

### API Endpoints Principais
- `/auth` - Autenticação e registro
- `/events` - CRUD de eventos
- `/memories` - Upload e gerenciamento de memórias
- `/trophies` - Coleção de troféus
- `/marketplace` - Compra e venda de troféus

## 🎯 Funcionalidades Principais

### 1. Autenticação
- Login social (Google, Facebook, Apple)
- Registro com email/senha
- Recuperação de senha
- Perfil de usuário

### 2. Gestão de Eventos
- Criação de eventos com design customizado
- Configuração de visibilidade (público/privado/não listado)
- Geração automática de códigos únicos
- Upload de imagem de capa

### 3. Sistema de Troféus
- Geração automática de troféus únicos por evento
- Design customizável (cores, formas, padrões)
- Coleção e visualização de troféus
- Sistema de transferência/marketplace

### 4. Memórias Digitais
- Upload de fotos e vídeos
- Organização por troféu/evento
- Controle de privacidade (privado/compartilhado)
- Galeria responsiva com preview

### 5. Marketplace
- Listagem de troféus para venda
- Sistema de compra integrado
- Histórico de transações
- Avaliações e reviews

## 🔮 Roadmap Futuro

### Próximas Funcionalidades
- [ ] Sistema de notificações em tempo real
- [ ] Chat entre participantes de eventos
- [ ] Integração com redes sociais
- [ ] App mobile nativo (React Native)
- [ ] Sistema de gamificação avançado
- [ ] Analytics e relatórios para criadores de eventos

### Melhorias Técnicas
- [ ] Implementação de PWA
- [ ] Otimização de bundle size
- [ ] Implementação de Service Workers
- [ ] Testes automatizados completos
- [ ] Monitoramento de performance
- [ ] Internacionalização (i18n)

## 🤝 Contribuição

### Guidelines de Desenvolvimento
1. Siga os padrões de código estabelecidos (ESLint)
2. Mantenha componentes pequenos e focados
3. Documente funções complexas com JSDoc
4. Teste suas alterações em diferentes dispositivos
5. Mantenha a acessibilidade em mente

### Processo de Contribuição
1. Fork do repositório
2. Crie uma branch para sua feature
3. Implemente as alterações
4. Execute os testes
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto:
- **Email**: suporte@memorias.app
- **Discord**: [Servidor da Comunidade]
- **GitHub Issues**: Para bugs e feature requests

---

**Desenvolvido com ❤️ pela equipe MEMORIAS**
