import { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabase'

const AppContext = createContext({})

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider')
  }
  return context
}

// Estados iniciais da aplicação
const initialState = {
  events: [],
  trophies: [],
  memories: [],
  marketplaceListings: [],
  loading: {
    events: false,
    trophies: false,
    memories: false,
    marketplace: false
  },
  errors: {},
  notifications: []
}

// Reducer para gerenciar estados da aplicação
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      }
    
    case 'SET_EVENTS':
      return {
        ...state,
        events: action.payload
      }
    
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload]
      }
    
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.id ? action.payload : event
        )
      }
    
    case 'SET_TROPHIES':
      return {
        ...state,
        trophies: action.payload
      }
    
    case 'ADD_TROPHY':
      return {
        ...state,
        trophies: [...state.trophies, action.payload]
      }
    
    case 'SET_MEMORIES':
      return {
        ...state,
        memories: action.payload
      }
    
    case 'ADD_MEMORY':
      return {
        ...state,
        memories: [...state.memories, action.payload]
      }
    
    case 'SET_MARKETPLACE_LISTINGS':
      return {
        ...state,
        marketplaceListings: action.payload
      }
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      }
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error
        }
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null
        }
      }
    
    default:
      return state
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { user } = useAuth()

  // Função para adicionar notificação
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now()
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { id, message, type, timestamp: new Date() }
    })

    // Remove a notificação automaticamente após o tempo especificado
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
    }, duration)
  }

  // Função para carregar eventos do usuário
  const loadUserEvents = async () => {
    if (!user) return

    dispatch({ type: 'SET_LOADING', payload: { key: 'events', value: true } })
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      dispatch({ type: 'SET_EVENTS', payload: data || [] })
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      dispatch({ type: 'SET_ERROR', payload: { key: 'events', error: error.message } })
      addNotification('Erro ao carregar eventos', 'error')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'events', value: false } })
    }
  }

  // Função para carregar troféus do usuário
  const loadUserTrophies = async () => {
    if (!user) return

    dispatch({ type: 'SET_LOADING', payload: { key: 'trophies', value: true } })
    
    try {
      const { data, error } = await supabase
        .from('chaves')
        .select(`
          *,
          events (
            id,
            name,
            event_date,
            cover_image_url
          )
        `)
        .eq('owner_id', user.id)
        .order('acquired_at', { ascending: false })

      if (error) throw error

      dispatch({ type: 'SET_TROPHIES', payload: data || [] })
    } catch (error) {
      console.error('Erro ao carregar troféus:', error)
      dispatch({ type: 'SET_ERROR', payload: { key: 'trophies', error: error.message } })
      addNotification('Erro ao carregar troféus', 'error')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'trophies', value: false } })
    }
  }

  // Função para carregar memórias do usuário
  const loadUserMemories = async () => {
    if (!user) return

    dispatch({ type: 'SET_LOADING', payload: { key: 'memories', value: true } })
    
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          chaves (
            id,
            serial_number,
            events (
              id,
              name
            )
          )
        `)
        .eq('uploader_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      dispatch({ type: 'SET_MEMORIES', payload: data || [] })
    } catch (error) {
      console.error('Erro ao carregar memórias:', error)
      dispatch({ type: 'SET_ERROR', payload: { key: 'memories', error: error.message } })
      addNotification('Erro ao carregar memórias', 'error')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'memories', value: false } })
    }
  }

  // Carregar dados quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      loadUserEvents()
      loadUserTrophies()
      loadUserMemories()
    } else {
      // Limpar dados quando o usuário fizer logout
      dispatch({ type: 'SET_EVENTS', payload: [] })
      dispatch({ type: 'SET_TROPHIES', payload: [] })
      dispatch({ type: 'SET_MEMORIES', payload: [] })
    }
  }, [user])

  const value = {
    ...state,
    dispatch,
    addNotification,
    loadUserEvents,
    loadUserTrophies,
    loadUserMemories
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
