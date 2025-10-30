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
import { formatDateTime } from '@/utils'
import { 
  MoreVertical, 
  Download, 
  Share2, 
  Trash2, 
  Eye, 
  Lock, 
  Users,
  Play,
  Image as ImageIcon
} from 'lucide-react'

const MemoryCard = ({ 
  memory, 
  onView, 
  onDownload, 
  onShare, 
  onDelete,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isVideo = memory.type === 'video'
  const isPrivate = memory.privacy === 'private'

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(memory)}
    >
      <CardContent className="p-0">
        {/* Área da mídia */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {!imageError ? (
            <>
              {/* Thumbnail da imagem/vídeo */}
              <img 
                src={memory.thumbnail_url || memory.file_url} 
                alt={memory.description || 'Memória'}
                className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {/* Loading placeholder */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </>
          ) : (
            /* Fallback para erro de carregamento */
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Erro ao carregar</p>
              </div>
            </div>
          )}

          {/* Overlay para vídeos */}
          {isVideo && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-gray-800 ml-1" />
              </div>
            </div>
          )}

          {/* Overlay com ações */}
          <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center ${isHovered ? 'bg-opacity-40' : ''}`}>
            <div className={`flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ${isHovered ? 'opacity-100' : ''}`}>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); onView?.(memory) }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); onDownload?.(memory) }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Badges de status */}
          <div className="absolute top-2 left-2 flex space-x-1">
            {isPrivate ? (
              <Badge variant="secondary" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Privada
              </Badge>
            ) : (
              <Badge variant="default" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Compartilhada
              </Badge>
            )}
            
            {isVideo && (
              <Badge variant="outline" className="text-xs">
                Vídeo
              </Badge>
            )}
          </div>

          {/* Menu de ações */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${isHovered ? 'opacity-100' : ''}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView?.(memory) }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver em Tela Cheia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload?.(memory) }}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare?.(memory) }}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(memory) }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Informações da memória */}
        <div className="p-3">
          {/* Descrição */}
          {memory.description && (
            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
              {memory.description}
            </p>
          )}

          {/* Metadados */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              {formatDateTime(memory.created_at)}
            </p>
            
            {memory.chaves?.events?.name && (
              <p className="text-xs text-gray-500">
                Evento: {memory.chaves.events.name}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MemoryCard
