import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppContext'
import { ChaveProvider } from '@/contexts/ChaveContext'
import { PecasProvider } from '@/contexts/PecasContext'
import { ThemeProvider } from "@/contexts/ThemeContext"

import LoginPage from '@/pages/LoginPage'
import CadastroPage from '@/pages/CadastroPage' // nova página
import DashboardPage from '@/pages/DashboardPage'
import TrophiesPage from '@/pages/TrophiesPage'
import AddNovaChave from '@/pages/AddNovaChave'
import MemoriasPage from '@/pages/MemoriasPage'
import NotificaçaoPage from '@/pages/NotificaçaoPage'
import NovoEventoPage from '@/pages/NovoEventoPage'
import PerfilPage from '@/pages/PerfilPage'
import AddImagens from '@/pages/AddImagens'
import MinhasMemorias from '@/pages/MinhasMemorias'
import MainLayout from '@/layouts/MainLayout'
import FeedEvento from '@/pages/FeedEvento'
import FeedGeral from '@/pages/FeedGeral'
import CompartilharPage from '@/pages/CompartilharPage'
import EditarFeed from '@/pages/EditarFeed'
import CuradoriaPage from '@/pages/CuradoriaPage'
import SuasMemorias from './pages/SuasMemorias'
import AdminPecasPage from './pages/AdminPecasPage'
import LojaPecasPage from './pages/LojaPecasPage'

import { URLS } from '@/constants'
import './App.css'

// 🔒 Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-foreground mt-4">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to={URLS.login} replace />

  return children
}

// 📦 Rotas principais
const AppRoutes = () => (
  <Routes>
    {/* Rotas públicas */}
    <Route path={URLS.login} element={<LoginPage />} />
    <Route path={URLS.cadastro || "/cadastro"} element={<CadastroPage />} /> {/* nova rota pública */}

    {/* Rotas protegidas */}
    <Route
      path={URLS.dashboard}
      element={
        <ProtectedRoute>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path={URLS.AdminPecasPage}
      element={
        <ProtectedRoute>
          <MainLayout>
            <AdminPecasPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />

        <Route
      path={URLS.LojaPecasPage}
      element={
        <ProtectedRoute>
          <MainLayout>
            <LojaPecasPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/addimagens/:chaveId"
      element={
        <ProtectedRoute>
          <MainLayout>
            <AddImagens />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/minhasmemorias/:chaveId"
      element={
        <ProtectedRoute>
          <MainLayout>
            <MinhasMemorias />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/suasmemorias/:chaveId"
      element={
        <ProtectedRoute>
          <MainLayout>
            <SuasMemorias />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/feedevento/:chaveId"
      element={
        <ProtectedRoute>
          <MainLayout>
            <FeedEvento />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/curadoriapage/:chaveId"
      element={
        <ProtectedRoute>
          <MainLayout>
            <CuradoriaPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/editarfeed/:chaveId"
      element={
        <ProtectedRoute>
          <MainLayout>
            <EditarFeed />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/feedgeral/:chaveId"
      element={
        <ProtectedRoute>
          <MainLayout>
            <FeedGeral />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/compartilharpage/:chaveId"
      element={
        <ProtectedRoute>
          <MainLayout>
            <CompartilharPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path={URLS.NovaChave}
      element={
        <ProtectedRoute>
          <MainLayout>
            <AddNovaChave />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path={URLS.trophies}
      element={
        <ProtectedRoute>
          <MainLayout>
            <TrophiesPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path={URLS.memories}
      element={
        <ProtectedRoute>
          <MainLayout>
            <MemoriasPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path={URLS.notifications}
      element={
        <ProtectedRoute>
          <MainLayout>
            <NotificaçaoPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path={URLS.NovoEvento}
      element={
        <ProtectedRoute>
          <MainLayout>
            <NovoEventoPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path={URLS.profile}
      element={
        <ProtectedRoute>
          <MainLayout>
            <PerfilPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />

    {/* Redirecionamentos */}
    <Route path="/" element={<Navigate to={URLS.dashboard} replace />} />
    <Route path="*" element={<Navigate to={URLS.dashboard} replace />} />
  </Routes>
)

// 🧩 Estrutura geral do App
function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <ChaveProvider>
            <PecasProvider>
              <Router>
                <AppRoutes />
              </Router>
            </PecasProvider>
          </ChaveProvider>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
