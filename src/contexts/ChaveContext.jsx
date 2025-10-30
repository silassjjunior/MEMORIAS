import React, { createContext, useContext, useState, useEffect } from 'react'

const ChaveContext = createContext()

export const ChaveProvider = ({ children }) => {
  const [chaveSelecionada, setChaveSelecionada] = useState(() => {
    // Tenta pegar do localStorage ao iniciar
    return localStorage.getItem('chaveSelecionada') || null
  })

  // Sempre que mudar, salvar no localStorage
  useEffect(() => {
    if (chaveSelecionada) {
      localStorage.setItem('chaveSelecionada', chaveSelecionada)
    } else {
      localStorage.removeItem('chaveSelecionada')
    }
  }, [chaveSelecionada])

  const limparChaveSelecionada = () => {
    setChaveSelecionada(null)
  }

  return (
    <ChaveContext.Provider
      value={{
        chaveSelecionada,
        setChaveSelecionada,
        limparChaveSelecionada,
      }}
    >
      {children}
    </ChaveContext.Provider>
  )
}

// Hook customizado para usar o contexto
export const useChave = () => {
  const context = useContext(ChaveContext)
  if (!context) {
    throw new Error('useChave deve ser usado dentro de um ChaveProvider')
  }
  return context
}
