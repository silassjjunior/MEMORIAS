import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/utils'
import { MoreVertical, Eye, Share2, ShoppingBag, Copy } from 'lucide-react'

const TrophyCard = ({ 
  trophy, 
  onView, 
  onShare, 
  onSell, 
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trophy.serial_number)
    // Aqui você pode adicionar uma notificação de sucesso
  }

  // Configuração do design do troféu baseada no evento
  const getTrophyDesign = () => {
    const config = trophy.events?.design_config || {}
    
    // Cores padrão baseadas no protótipo
    const defaultColors = {
      silver: 'bg-gradient-to-br from-gray-300 to-gray-500',
      gold: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
      red: 'bg-gradient-to-br from-red-400 to-red-600',
      green: 'bg-gradient-to-br from-green-400 to-green-600',
      purple: 'bg-gradient-to-br from-purple-400 to-purple-600',
      pink: 'bg-gradient-to-br from-pink-400 to-pink-600'
    }

    const color = config.color || 'silver'
    return {
      background: defaultColors[color] || defaultColors.silver,
      shape: config.shape || 'shield',
      pattern: config.pattern || null
    }
  }

  const design = getTrophyDesign()

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(trophy)}
    >
      <CardContent className="p-6">
        {/* Header com ações */}
        <div className="flex justify-between items-start mb-4">
          <Badge variant="secondary" className="text-xs">
            {trophy.events?.name || 'Evento'}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`opacity-0 group-hover:opacity-100 transition-opacity ${isHovered ? 'opacity-100' : ''}`}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView?.(trophy) }}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare?.(trophy) }}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyCode() }}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Código
              </DropdownMenuItem>
              {trophy.is_transferable && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSell?.(trophy) }}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Vender
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Troféu Visual */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            {/* Base do troféu */}
            <div className="w-20 h-6 bg-gradient-to-r from-amber-600 to-amber-800 rounded-b-lg shadow-lg"></div>
            
            {/* Corpo do troféu */}
            <div className={`w-16 h-20 ${design.background} rounded-t-lg mx-2 -mb-2 shadow-lg flex items-center justify-center relative overflow-hidden`}>
              {/* Padrão/textura se houver */}
              {design.pattern && (
                <div className="absolute inset-0 opacity-20 bg-pattern"></div>
              )}
              
              {/* Ícone ou inicial do evento */}
              <div className="text-white font-bold text-lg">
                {trophy.events?.name?.charAt(0)?.toUpperCase() || 'M'}
              </div>
              
              {/* Brilho/reflexo */}
              <div className="absolute top-2 left-2 w-3 h-3 bg-white opacity-30 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Informações do troféu */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {trophy.events?.name || 'Evento Sem Nome'}
          </h3>
          
          <p className="text-sm text-gray-500">
            {trophy.serial_number}
          </p>
          
          <p className="text-xs text-gray-400">
            Adquirido em {formatDate(trophy.acquired_at)}
          </p>
        </div>

        {/* Indicadores de status */}
        <div className="flex justify-center mt-4 space-x-2">
          {trophy.is_transferable && (
            <Badge variant="outline" className="text-xs">
              Transferível
            </Badge>
          )}
          
          {trophy.events?.event_date && new Date(trophy.events.event_date) > new Date() && (
            <Badge variant="secondary" className="text-xs">
              Futuro
            </Badge>
          )}
        </div>

        {/* Ações rápidas */}
        <div className={`flex justify-center mt-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ${isHovered ? 'opacity-100' : ''}`}>
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onView?.(trophy) }}
          >
            Ver
          </Button>
          
          {trophy.is_transferable && (
            <Button 
              size="sm"
              onClick={(e) => { e.stopPropagation(); onSell?.(trophy) }}
            >
              Vender
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TrophyCard
