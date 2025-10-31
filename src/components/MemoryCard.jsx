import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/utils";
import {
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Eye,
  Lock,
  Users,
  Play,
  Image as ImageIcon,
} from "lucide-react";

const MemoryCard = ({
  memory,
  onView,
  onDownload,
  onShare,
  onDelete,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const videoRef = useRef(null);

  const isVideo = memory.type === "video";
  const isPrivate = memory.privacy === "private";
  const aspectRatio = memory.aspect_ratio || "1/1"; // Mantém proporção

  const handleMediaLoad = () => setMediaLoaded(true);
  const handleMediaError = () => setMediaError(true);

  // 🔁 Pausa o vídeo quando não estiver em hover (economia e UX)
  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isHovered]);

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(memory)}
    >
      <CardContent className="p-0">
        {/* 🎥 / 🖼️ Mídia principal */}
        <div
          className="relative w-full overflow-hidden rounded-t-lg bg-gray-100"
          style={{ aspectRatio }}
        >
          {!mediaError ? (
            <>
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={memory.file_url}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedData={handleMediaLoad}
                  onError={handleMediaError}
                  className={`w-full h-full object-contain transition-all duration-500 ${
                    mediaLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              ) : (
                <img
                  src={memory.thumbnail_url || memory.file_url}
                  alt={memory.description || "Memória"}
                  onLoad={handleMediaLoad}
                  onError={handleMediaError}
                  className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-105 ${
                    mediaLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              {!mediaLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Erro ao carregar mídia</p>
              </div>
            </div>
          )}

          {/* ▶️ Overlay para vídeos */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-md">
                <Play className="w-5 h-5 text-gray-800 ml-1" />
              </div>
            </div>
          )}

          {/* 🖱️ Overlay de ações */}
          <div
            className={`absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center ${
              isHovered ? "bg-black/40" : ""
            }`}
          >
            <div
              className={`flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                isHovered ? "opacity-100" : ""
              }`}
            >
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(memory);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload?.(memory);
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 🏷️ Badges */}
          <div className="absolute top-2 left-2 flex space-x-1">
            {isPrivate ? (
              <Badge variant="secondary" className="text-xs flex items-center">
                <Lock className="w-3 h-3 mr-1" /> Privada
              </Badge>
            ) : (
              <Badge variant="default" className="text-xs flex items-center">
                <Users className="w-3 h-3 mr-1" /> Pública
              </Badge>
            )}
            {isVideo && (
              <Badge variant="outline" className="text-xs">
                Vídeo
              </Badge>
            )}
          </div>

          {/* ⋮ Menu de ações */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    isHovered ? "opacity-100" : ""
                  }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(memory);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver em Tela Cheia
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload?.(memory);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.(memory);
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(memory);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 🧾 Informações da memória */}
        <div className="p-3">
          {memory.description && (
            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
              {memory.description}
            </p>
          )}

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
  );
};

export default MemoryCard;
