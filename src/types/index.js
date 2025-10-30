// Tipos e interfaces para o projeto MEMORIAS
// Usando JSDoc para documentação de tipos em JavaScript

/**
 * @typedef {Object} User
 * @property {string} id - ID único do usuário
 * @property {string} email - Email do usuário
 * @property {string} username - Nome de usuário único
 * @property {string|null} avatar_url - URL da imagem de perfil
 * @property {string} created_at - Data de criação da conta
 * @property {string} updated_at - Data da última atualização
 */

/**
 * @typedef {Object} Event
 * @property {string} id - ID único do evento
 * @property {string} creator_id - ID do usuário criador
 * @property {string} name - Nome do evento
 * @property {string|null} description - Descrição do evento
 * @property {string} event_date - Data do evento
 * @property {'public'|'private'|'unlisted'} visibility - Visibilidade do evento
 * @property {string|null} cover_image_url - URL da imagem de capa
 * @property {Object|null} design_config - Configuração do design do troféu
 * @property {string} event_code_prefix - Prefixo único para códigos das chaves
 * @property {string} created_at - Data de criação
 */

/**
 * @typedef {Object} Trophy
 * @property {string} id - ID único do troféu/chave
 * @property {string} event_id - ID do evento associado
 * @property {string} owner_id - ID do proprietário atual
 * @property {string} serial_number - Código único do troféu
 * @property {boolean} is_transferable - Se pode ser transferido/vendido
 * @property {string} created_at - Data de criação
 * @property {string} acquired_at - Data de aquisição pelo proprietário atual
 * @property {Event|null} events - Dados do evento (quando incluído)
 */

/**
 * @typedef {Object} Memory
 * @property {string} id - ID único da memória
 * @property {string} chave_id - ID do troféu associado
 * @property {string} uploader_id - ID do usuário que fez upload
 * @property {string} file_url - URL do arquivo de mídia
 * @property {string|null} thumbnail_url - URL da thumbnail
 * @property {'image'|'video'} type - Tipo de mídia
 * @property {'private'|'shared'} privacy - Nível de privacidade
 * @property {string|null} description - Descrição da memória
 * @property {string} created_at - Data de upload
 * @property {Trophy|null} chaves - Dados do troféu (quando incluído)
 */

/**
 * @typedef {Object} MarketplaceListing
 * @property {string} id - ID único do anúncio
 * @property {string} chave_id - ID do troféu sendo vendido
 * @property {string} seller_id - ID do vendedor
 * @property {number} price - Preço de venda
 * @property {'active'|'sold'|'cancelled'} status - Status do anúncio
 * @property {string} listed_at - Data de listagem
 * @property {string|null} sold_at - Data da venda
 * @property {Trophy|null} chaves - Dados do troféu (quando incluído)
 * @property {User|null} seller - Dados do vendedor (quando incluído)
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user - Usuário autenticado
 * @property {Object|null} session - Sessão do Supabase
 * @property {boolean} loading - Estado de carregamento
 */

/**
 * @typedef {Object} AppState
 * @property {Event[]} events - Lista de eventos
 * @property {Trophy[]} trophies - Lista de troféus
 * @property {Memory[]} memories - Lista de memórias
 * @property {MarketplaceListing[]} marketplaceListings - Lista de anúncios do marketplace
 * @property {Object} loading - Estados de carregamento por seção
 * @property {Object} errors - Erros por seção
 * @property {Notification[]} notifications - Lista de notificações
 */

/**
 * @typedef {Object} Notification
 * @property {number} id - ID único da notificação
 * @property {string} message - Mensagem da notificação
 * @property {'success'|'error'|'warning'|'info'} type - Tipo da notificação
 * @property {Date} timestamp - Data/hora da notificação
 */

/**
 * @typedef {Object} UploadFile
 * @property {File} file - Arquivo a ser enviado
 * @property {string} id - ID único temporário
 * @property {'image'|'video'} type - Tipo do arquivo
 * @property {string} preview - URL de preview
 * @property {'pending'|'uploading'|'success'|'error'} status - Status do upload
 * @property {number} progress - Progresso do upload (0-100)
 * @property {string|null} error - Mensagem de erro (se houver)
 */

/**
 * @typedef {Object} TrophyDesign
 * @property {string} shape - Formato do troféu (shield, circle, hexagon, etc.)
 * @property {string} color - Cor principal
 * @property {string} accent - Cor de destaque
 * @property {string|null} pattern - Padrão de fundo
 * @property {string|null} icon - Ícone central
 * @property {string|null} border - Estilo da borda
 */

/**
 * @typedef {Object} EventFormData
 * @property {string} name - Nome do evento
 * @property {string} description - Descrição do evento
 * @property {string} event_date - Data do evento
 * @property {'public'|'private'|'unlisted'} visibility - Visibilidade
 * @property {File|null} cover_image - Arquivo de imagem de capa
 * @property {TrophyDesign} design_config - Configuração do design do troféu
 */

/**
 * @typedef {Object} MemoryFormData
 * @property {UploadFile[]} files - Arquivos a serem enviados
 * @property {'private'|'shared'} privacy - Nível de privacidade
 * @property {string} description - Descrição das memórias
 * @property {string} chave_id - ID do troféu associado
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Se a operação foi bem-sucedida
 * @property {any} data - Dados retornados (se sucesso)
 * @property {Object|null} error - Erro retornado (se falha)
 */

// Exportar tipos para uso em outros arquivos (apenas para documentação)
export const Types = {
  User: 'User',
  Event: 'Event',
  Trophy: 'Trophy',
  Memory: 'Memory',
  MarketplaceListing: 'MarketplaceListing',
  AuthState: 'AuthState',
  AppState: 'AppState',
  Notification: 'Notification',
  UploadFile: 'UploadFile',
  TrophyDesign: 'TrophyDesign',
  EventFormData: 'EventFormData',
  MemoryFormData: 'MemoryFormData',
  ApiResponse: 'ApiResponse'
}
