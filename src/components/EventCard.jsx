import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/utils'
import { 
  MoreVertical, 
  Calendar, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Share2,
  Trophy,
  Camera
} from 'lucide-react'

const EventCard = ({ 
  event, 
  onEdit, 
  onDelete, 
  onShare,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getVisibilityBadge = () => {
    const variants = {
      public: { variant: 'default', label: 'Público' },
      private: { variant: 'secondary', label: 'Privado' },
      unlisted: { variant: 'outline', label: 'Não listado' }
    }
    
    return variants[event.visibility] || variants.private
  }

  const visibilityBadge = getVisibilityBadge()

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagem de capa */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {event.cover_image_url ? (
          <img 
            src={event.cover_image_url} 
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-60" />
              <p className="text-sm opacity-80">Sem imagem de capa</p>
            </div>
          </div>
        )}
        
        {/* Overlay com ações */}
        <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center ${isHovered ? 'bg-opacity-30' : ''}`}>
          <div className={`flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ${isHovered ? 'opacity-100' : ''}`}>
            <Link to={`/events/${event.id}`}>
              <Button size="sm" variant="secondary">
                <Eye className="w-4 h-4 mr-2" />
                Ver
              </Button>
            </Link>
            <Button size="sm" variant="secondary" onClick={() => onEdit?.(event)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Badge de visibilidade */}
        <div className="absolute top-3 left-3">
          <Badge variant={visibilityBadge.variant}>
            {visibilityBadge.label}
          </Badge>
        </div>

        {/* Menu de ações */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm" 
                className={`opacity-0 group-hover:opacity-100 transition-opacity ${isHovered ? 'opacity-100' : ''}`}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/events/${event.id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(event)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(event)}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(event)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Título e descrição */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {event.name}
          </h3>
          
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        {/* Informações do evento */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(event.event_date)}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Trophy className="w-4 h-4 mr-2" />
            Código: {event.event_code_prefix}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>0 participantes</span>
          </div>
          
          <div className="flex items-center">
            <Camera className="w-4 h-4 mr-1" />
            <span>0 memórias</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex w-full space-x-2">
          <Link to={`/events/${event.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Ver Evento
            </Button>
          </Link>
          
          <Link to={`/events/${event.id}/memories/upload`} className="flex-1">
            <Button className="w-full">
              Adicionar Memórias
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default EventCard
