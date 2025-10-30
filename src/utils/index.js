// Utilitários para o projeto MEMORIAS

/**
 * Formata uma data para exibição
 * @param {string|Date} date - Data a ser formatada
 * @param {string} locale - Locale para formatação (padrão: pt-BR)
 * @returns {string} Data formatada
 */
export const formatDate = (date, locale = 'pt-BR') => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj)
}

/**
 * Formata uma data e hora para exibição
 * @param {string|Date} date - Data a ser formatada
 * @param {string} locale - Locale para formatação (padrão: pt-BR)
 * @returns {string} Data e hora formatadas
 */
export const formatDateTime = (date, locale = 'pt-BR') => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

/**
 * Formata um preço em reais
 * @param {number} price - Preço a ser formatado
 * @returns {string} Preço formatado
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number') return 'R$ 0,00'
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

/**
 * Formata o tamanho de um arquivo
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Valida um endereço de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} Se o email é válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida uma senha
 * @param {string} password - Senha a ser validada
 * @returns {Object} Resultado da validação
 */
export const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers
  
  return {
    isValid,
    errors: {
      minLength: password.length < minLength,
      hasUpperCase: !hasUpperCase,
      hasLowerCase: !hasLowerCase,
      hasNumbers: !hasNumbers,
      hasSpecialChar: !hasSpecialChar
    }
  }
}

/**
 * Valida um arquivo de upload
 * @param {File} file - Arquivo a ser validado
 * @param {Object} config - Configurações de validação
 * @returns {Object} Resultado da validação
 */
export const validateFile = (file, config = {}) => {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
  } = config
  
  const errors = []
  
  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Máximo permitido: ${formatFileSize(maxSize)}`)
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('Tipo de arquivo não permitido')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Gera um ID único
 * @returns {string} ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Debounce uma função
 * @param {Function} func - Função a ser debounced
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função debounced
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle uma função
 * @param {Function} func - Função a ser throttled
 * @param {number} limit - Limite de tempo em ms
 * @returns {Function} Função throttled
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Cria uma URL de preview para um arquivo
 * @param {File} file - Arquivo
 * @returns {string} URL de preview
 */
export const createFilePreview = (file) => {
  return URL.createObjectURL(file)
}

/**
 * Revoga uma URL de preview
 * @param {string} url - URL a ser revogada
 */
export const revokeFilePreview = (url) => {
  URL.revokeObjectURL(url)
}

/**
 * Copia texto para a área de transferência
 * @param {string} text - Texto a ser copiado
 * @returns {Promise<boolean>} Se a operação foi bem-sucedida
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback para navegadores mais antigos
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

/**
 * Converte uma string para slug (URL-friendly)
 * @param {string} text - Texto a ser convertido
 * @returns {string} Slug gerado
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Trunca um texto
 * @param {string} text - Texto a ser truncado
 * @param {number} length - Comprimento máximo
 * @param {string} suffix - Sufixo (padrão: '...')
 * @returns {string} Texto truncado
 */
export const truncateText = (text, length, suffix = '...') => {
  if (!text || text.length <= length) return text
  return text.substring(0, length) + suffix
}

/**
 * Calcula o tempo relativo (ex: "há 2 horas")
 * @param {string|Date} date - Data a ser comparada
 * @returns {string} Tempo relativo
 */
export const getRelativeTime = (date) => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now - dateObj) / 1000)
  
  const intervals = [
    { label: 'ano', seconds: 31536000 },
    { label: 'mês', seconds: 2592000 },
    { label: 'semana', seconds: 604800 },
    { label: 'dia', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 }
  ]
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds)
    if (count >= 1) {
      return `há ${count} ${interval.label}${count > 1 ? 's' : ''}`
    }
  }
  
  return 'agora mesmo'
}

/**
 * Gera cores aleatórias para troféus
 * @returns {Object} Objeto com cores primária e de destaque
 */
export const generateTrophyColors = () => {
  const colors = [
    { primary: '#3B82F6', accent: '#1D4ED8' }, // Azul
    { primary: '#EF4444', accent: '#DC2626' }, // Vermelho
    { primary: '#10B981', accent: '#059669' }, // Verde
    { primary: '#F59E0B', accent: '#D97706' }, // Amarelo
    { primary: '#8B5CF6', accent: '#7C3AED' }, // Roxo
    { primary: '#EC4899', accent: '#DB2777' }, // Rosa
    { primary: '#06B6D4', accent: '#0891B2' }, // Ciano
    { primary: '#84CC16', accent: '#65A30D' }  // Lima
  ]
  
  return colors[Math.floor(Math.random() * colors.length)]
}
