// src/layouts/MainLayout.jsx
import React from 'react'
import Navigation from '@/components/Navigation'

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Barra de navegação superior e inferior */}
      <Navigation />

      {/* Conteúdo da página */}
      <main className="flex-1 mt-0 p-0">
        {children}
      </main>
    </div>
  )
}

export default MainLayout
