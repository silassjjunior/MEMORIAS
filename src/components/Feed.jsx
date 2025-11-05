import React, { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useParams } from "react-router-dom"
import { Heart as HeartIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const Feed = ({ tipo }) => {
  const { user } = useAuth()
  const { chaveId } = useParams()
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadedOnce, setLoadedOnce] = useState(false)
  const [commentModalMemory, setCommentModalMemory] = useState(null)
  const [newComment, setNewComment] = useState("")
  const commentsInterval = useRef(null)
  const videoRefs = useRef({})

  // --- 🔁 Busca inicial
  useEffect(() => {
    if (!chaveId && tipo !== "geral") return
    fetchMemories()
    return () => clearInterval(commentsInterval.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveId])

  // --- 🚀 Buscar memórias
  const fetchMemories = async () => {
    try {
      setLoading(!loadedOnce)

      let query = supabase
        .from("memories")
        .select(
          `id, file_url, legenda, compartilhado_em,
           uploader: uploader_id(id, username, avatar_url),
           comments(id, content, created_at, user: user_id(id, username, avatar_url)),
           likes(id, user_id)`
        )
        .order("compartilhado_em", { ascending: false })

      if (tipo === "geral") {
        const { data: chaveData, error: chaveError } = await supabase
          .from("chaves")
          .select("event_id")
          .eq("id", chaveId)
          .single()
        if (chaveError) throw chaveError
        query = query.eq("event_id", chaveData.event_id).eq("shared_to_event", true)
      }

      if (tipo === "minhas") query = query.eq("chave_id", chaveId)

      const { data, error } = await query
      if (error) throw error

      // 🔧 Mantém proporção detectada anteriormente
      setMemories((prev) => {
        const aspectMap = Object.fromEntries(prev.map((m) => [m.id, m.aspect || "square"]))
        const formatted = (data || []).map((m) => ({
          ...m,
          aspect: aspectMap[m.id] || "square",
        }))
        return formatted
      })

      setLoadedOnce(true)
    } catch (err) {
      console.error("Erro ao carregar feed:", err)
    } finally {
      setLoading(false)
    }
  }

  // --- 💬 Atualiza comentários
  const fetchCommentsForMemory = async (memoryId) => {
    const { data, error } = await supabase
      .from("comments")
      .select(`id, content, created_at, user: user_id(id, username, avatar_url)`)
      .eq("memorie_id", memoryId)
      .order("created_at", { ascending: true })

    if (!error) setCommentModalMemory((prev) => ({ ...prev, comments: data }))
  }

  const handleAddComment = async (memoryId) => {
    if (!user || !newComment.trim()) return
    try {
      await supabase.from("comments").insert({
        content: newComment,
        memorie_id: memoryId,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })
      setNewComment("")
      fetchCommentsForMemory(memoryId)
      fetchMemories()
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err)
    }
  }

  // --- ❤️ Curtidas
  const handleToggleLike = async (memoryId, liked) => {
    if (!user) return
    try {
      if (liked) {
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("memorie_id", memoryId)
      } else {
        await supabase.from("likes").insert({
          user_id: user.id,
          memorie_id: memoryId,
        })
      }
      fetchMemories()
    } catch (err) {
      console.error("Erro ao atualizar like:", err)
    }
  }

  // --- 💬 Modal
  const openCommentsModal = (memorie) => {
    setCommentModalMemory(memorie)
    fetchCommentsForMemory(memorie.id)
    commentsInterval.current = setInterval(() => {
      fetchCommentsForMemory(memorie.id)
    }, 3000)
  }

  const closeCommentsModal = () => {
    setCommentModalMemory(null)
    clearInterval(commentsInterval.current)
  }

  // --- 🎥 AutoPlay inteligente (somente se visível na tela)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (video.tagName !== "VIDEO") return
          if (entry.isIntersecting) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.6 }
    )

    Object.values(videoRefs.current).forEach((v) => {
      if (v) observer.observe(v)
    })

    return () => observer.disconnect()
  }, [memories])

  // --- 🧭 Renderização
  return (
    <div className="min-h-screen bg-background text-foreground p-4 mb-14">
      {loading && !loadedOnce ? (
        <div className="text-center text-gray-500 animate-pulse">Carregando feed...</div>
      ) : memories.length === 0 ? (
        <div className="text-center text-gray-500">Nenhuma memória encontrada.</div>
      ) : (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {memories.map((memorie) => {
            const liked = memorie.likes?.some((like) => like.user_id === user?.id)
            const isVideo = memorie.file_url.match(/\.(mp4|webm|ogg)$/i)

            const aspectClass =
              memorie.aspect === "horizontal"
                ? "aspect-video"
                : memorie.aspect === "vertical"
                ? "aspect-[9/16]"
                : "aspect-square"

            return (
              <motion.div
                key={memorie.id}
                layout
                className="p-4 bg-card rounded-2xl shadow transition-transform hover:scale-[1.01]"
              >
                {/* Header */}
                <div className="flex items-center mb-2">
                  <img
                    src={memorie.uploader.avatar_url || "/default-avatar.png"}
                    alt={memorie.uploader.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-bold">{memorie.uploader.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(memorie.compartilhado_em).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Mídia com proporção dinâmica */}
                <div className={`w-full ${aspectClass} overflow-hidden rounded-2xl mb-2`}>
                  {isVideo ? (
                    <video
                      ref={(el) => (videoRefs.current[memorie.id] = el)}
                      src={memorie.file_url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        const vid = e.target
                        const aspect = vid.videoWidth / vid.videoHeight
                        setMemories((prev) =>
                          prev.map((m) =>
                            m.id === memorie.id
                              ? {
                                  ...m,
                                  aspect:
                                    aspect > 1.2
                                      ? "horizontal"
                                      : aspect < 0.9
                                      ? "vertical"
                                      : "square",
                                }
                              : m
                          )
                        )
                      }}
                    />
                  ) : (
                    <img
                      src={memorie.file_url}
                      alt="Memória"
                      className="w-full h-full object-cover"
                      onLoad={(e) => {
                        const img = e.target
                        const aspect = img.naturalWidth / img.naturalHeight
                        setMemories((prev) =>
                          prev.map((m) =>
                            m.id === memorie.id
                              ? {
                                  ...m,
                                  aspect:
                                    aspect > 1.2
                                      ? "horizontal"
                                      : aspect < 0.9
                                      ? "vertical"
                                      : "square",
                                }
                              : m
                          )
                        )
                      }}
                    />
                  )}
                </div>

                {/* Legenda */}
                {memorie.legenda && (
                  <p className="mb-2">{memorie.legenda}</p>
                )}

                {/* Likes e comentários */}
                <div className="flex justify-between text-sm text-muted-foreground items-center">
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => handleToggleLike(memorie.id, liked)}
                  >
                    <HeartIcon
                      size={20}
                      className={`transition ${
                        liked ? "text-red-500 fill-red-500" : "text-gray-500"
                      }`}
                    />
                    <span>{memorie.likes?.length || 0}</span>
                  </button>

                  <button
                    className="font-semibold hover:text-blue-500 transition"
                    onClick={() => openCommentsModal(memorie)}
                  >
                    {memorie.comments?.length || 0} comentários
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* --- 💬 Modal de comentários --- */}
      <AnimatePresence>
        {commentModalMemory && (
          <motion.div
            className="fixed inset-0 bg-gray-900/95 flex flex-col justify-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full h-full relative p-4 flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button
                className="absolute top-4 right-4 font-bold text-2xl text-white"
                onClick={closeCommentsModal}
              >
                &times;
              </button>

              <h2 className="font-bold text-lg mb-4 text-white">Comentários</h2>

              <div className="flex-1 overflow-y-auto mb-4 space-y-3 text-white">
                {commentModalMemory.comments?.map((comment) => (
                  <div key={comment.id} className="flex items-center space-x-2">
                    <img
                      src={comment.user.avatar_url || "/default-avatar.png"}
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <span className="font-bold">{comment.user.username}:</span>{" "}
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Adicione um comentário..."
                  className="flex-1 p-3 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-white"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddComment(commentModalMemory.id)
                  }}
                />
                <button
                  className="px-4 py-2 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition"
                  onClick={() => handleAddComment(commentModalMemory.id)}
                >
                  Enviar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Feed
