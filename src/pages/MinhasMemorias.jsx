import React, { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useChave } from "@/contexts/ChaveContext"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Plus,
  Lock,
  Globe,
  Heart as HeartIcon,
  MessageCircle,
  Share,
  LayoutList,
  LayoutGrid,
  LayoutDashboard,
  MoreHorizontal
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "ogg", "mkv"]

const MinhasMemoriasPage = () => {
  const { user } = useAuth()
  const { chaveSelecionada } = useChave()
  const { chaveId: paramChaveId } = useParams()
  const [chaveId, setChaveId] = useState(null)
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [viewMode, setViewMode] = useState("full")
  const [viewModeMenuOpen, setViewModeMenuOpen] = useState(false)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [commentModalMemory, setCommentModalMemory] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [eventData, setEventData] = useState({ name: "Evento Desconhecido", design_url: null })
  const [optionsOpen, setOptionsOpen] = useState(null)
  const commentsInterval = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    fetchMemories()
    return () => clearInterval(commentsInterval.current)
  }, [user, chaveSelecionada, paramChaveId])

  const fetchMemories = async () => {
    try {
      setLoading(true)
      const mainChaveId = paramChaveId || chaveSelecionada
      if (!mainChaveId) {
        setLoading(false)
        return
      }
      setChaveId(mainChaveId)

      const { data: memoriesData, error: memoriesError } = await supabase
        .from("memories")
        .select(
          `id, file_url, type, privacy, created_at,
           uploader: uploader_id(id, username, avatar_url),
           comments(id, content, created_at, user: user_id(id, username, avatar_url)),
           likes(id, user_id),
           chave: chave_id(event_id)`
        )
        .eq("chave_id", String(mainChaveId))
        .order("created_at", { ascending: false })
      if (memoriesError) throw memoriesError
      setMemories(memoriesData || [])

      if (memoriesData && memoriesData[0]?.chave?.event_id) {
        const eventId = memoriesData[0].chave.event_id
        const { data: eventDataResp } = await supabase
          .from("events")
          .select("name, design_url")
          .eq("id", eventId)
          .single()
        if (eventDataResp) setEventData(eventDataResp)
      }
    } catch (err) {
      console.error("Erro ao buscar memórias:", err)
    } finally {
      setLoading(false)
    }
  }

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
        created_at: new Date().toISOString()
      })
      setNewComment("")
      fetchCommentsForMemory(memoryId)
      fetchMemories()
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err)
    }
  }

  const handleToggleLike = async (memoryId, liked) => {
    if (!user) return
    try {
      if (liked) {
        await supabase.from("likes").delete().eq("user_id", user.id).eq("memorie_id", memoryId)
      } else {
        await supabase.from("likes").insert({ user_id: user.id, memorie_id: memoryId })
      }
      fetchMemories()
    } catch (err) {
      console.error("Erro ao atualizar like:", err)
    }
  }

  const openCommentsModal = (memorie) => {
    setCommentModalMemory(memorie)
    fetchCommentsForMemory(memorie.id)
    commentsInterval.current = setInterval(() => fetchCommentsForMemory(memorie.id), 3000)
  }
  const closeCommentsModal = () => {
    setCommentModalMemory(null)
    clearInterval(commentsInterval.current)
  }

  const handleDeleteMemory = async (memoryId) => {
    try {
      await supabase.from("memories").delete().eq("id", memoryId)
      fetchMemories()
    } catch (err) {
      console.error("Erro ao excluir memória:", err)
    }
  }

  const handleTogglePrivacy = async (memory) => {
    try {
      const newPrivacy = memory.privacy === "private" ? "public" : "private"
      await supabase.from("memories").update({ privacy: newPrivacy }).eq("id", memory.id)
      fetchMemories()
    } catch (err) {
      console.error("Erro ao alterar privacidade:", err)
    }
  }

  const filteredMemories = filter === "all" ? memories : memories.filter((m) => m.privacy === filter)

  const getGridClasses = () => {
    switch (viewMode) {
      case "medium": return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
      case "small": return "grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-1"
      default: return "flex flex-col space-y-6"
    }
  }

  const renderViewModeIcon = (mode) => {
    switch (mode) {
      case "medium": return <LayoutGrid size={18} />
      case "small": return <LayoutDashboard size={18} />
      default: return <LayoutList size={18} />
    }
  }

  const renderMedia = (memorie) => {
    const ext = memorie.type?.toLowerCase() || memorie.file_url.split(".").pop().toLowerCase()
    if (VIDEO_EXTENSIONS.includes(ext)) {
      if (viewMode === "full") {
        return <video src={memorie.file_url} controls className="w-full h-auto max-h-[28rem] rounded-2xl mb-2" />
      }
      return <video src={memorie.file_url} autoPlay loop muted className="w-full h-full object-cover" />
    }
    return <img src={memorie.file_url} alt="Memória" className={viewMode === "full" ? "w-full h-auto max-h-[28rem] object-contain rounded-2xl mb-2" : "w-full h-full object-cover"} />
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-card dark:bg-card-dark shadow-sm p-4 sticky top-0 z-20 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <button onClick={() => navigate(-1)} className="text-foreground dark:text-foreground">
              <ArrowLeft size={24} />
            </button>
            {eventData.design_url ? (
              <img src={eventData.design_url} alt="Chave" className="w-15 h-15 rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-gray-400 rounded-full" />
            )}
            <div className="font-bold text-sm">MINHAS MEMÓRIAS</div>
          </div>

          <button
            onClick={() => navigate(`/addimagens/${chaveId}`)}
            className="flex items-center space-x-1 bg-primary dark:bg-primary-dark text-white px-3 py-2 rounded-2xl hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition"
          >
            <Plus size={16} />
            <span>Adicionar</span>
          </button>
        </div>

        <div className="flex items-center justify-between ml-10">
          <div className="text-lg font-semibold text-center">{eventData.name}</div>

          <div className="flex items-center space-x-2">
            {/* Filtro */}
            <div className="relative">
              <button onClick={() => setFilterMenuOpen(!filterMenuOpen)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full transition">☰</button>
              {filterMenuOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute mt-2 flex flex-col space-y-2 bg-card dark:bg-card-dark p-2 rounded-xl shadow-lg z-30">
                  <button onClick={() => { setFilter("all"); setFilterMenuOpen(false) }} className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Todos</button>
                  <button onClick={() => { setFilter("private"); setFilterMenuOpen(false) }} className="flex items-center p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"><Lock size={16} /></button>
                  <button onClick={() => { setFilter("public"); setFilterMenuOpen(false) }} className="flex items-center p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"><Globe size={16} /></button>
                </motion.div>
              )}
            </div>

            {/* ViewMode */}
            <div className="relative">
              <button onClick={() => setViewModeMenuOpen(!viewModeMenuOpen)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full transition" title="Mudar visualização">{renderViewModeIcon(viewMode)}</button>
              {viewModeMenuOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 flex flex-col space-y-2 bg-card dark:bg-card-dark p-2 rounded-xl shadow-lg z-30">
                  {["full","medium","small"].map((mode) => (
                    <button key={mode} onClick={() => { setViewMode(mode); setViewModeMenuOpen(false) }} className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center">{renderViewModeIcon(mode)}</button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="flex-1 p-4 transition-colors duration-300">
        {loading ? <p className="text-center text-muted-foreground dark:text-muted-foreground animate-pulse">Carregando memórias...</p>
          : filteredMemories.length === 0 ? <p className="text-center text-muted-foreground dark:text-muted-foreground">Nenhuma memória encontrada.</p>
          : <motion.div className={getGridClasses()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {filteredMemories.map((memorie) => {
                const liked = memorie.likes?.some((like) => like.user_id === user?.id)
                const isMine = memorie.uploader?.id === user.id
                const ext = memorie.type?.toLowerCase() || memorie.file_url.split(".").pop().toLowerCase()

                // Full mode
                if (viewMode === "full") {
                  return (
                    <motion.div key={memorie.id} layout className="p-4 bg-card dark:bg-card-dark rounded-2xl shadow transition-transform hover:scale-[1.01] relative">
                      <div className="flex items-center mb-2">
                        <img src={memorie.uploader.avatar_url || "/default-avatar.png"} alt={memorie.uploader.username} className="w-12 h-12 rounded-full mr-3"/>
                        <div>
                          <div className="font-bold">{memorie.uploader.username}</div>
                          <div className="text-sm text-muted-foreground dark:text-muted-foreground">{new Date(memorie.created_at).toLocaleString()}</div>
                        </div>

                        {/* Privacy Icon */}
                        <div className="ml-auto">{memorie.privacy === "private" ? <Lock size={16}/> : <Globe size={16}/>}</div>

                        {/* Menu 3 pontos */}
                        {isMine && (
                          <div className="relative ml-2">
                            <button onClick={() => setOptionsOpen(optionsOpen === memorie.id ? null : memorie.id)}><MoreHorizontal size={20}/></button>
                            {optionsOpen === memorie.id && (
                              <div className="absolute right-0 mt-2 w-40 bg-card dark:bg-card-dark shadow-lg rounded-xl flex flex-col">
                                <button onClick={() => handleDeleteMemory(memorie.id)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700">Excluir</button>
                                <button onClick={() => handleTogglePrivacy(memorie)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700">Alterar privacidade</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {renderMedia(memorie)}

                      <div className="flex justify-between text-sm text-muted-foreground dark:text-muted-foreground items-center mt-2">
                        <button className="flex items-center space-x-1" onClick={() => handleToggleLike(memorie.id, liked)}>
                          <HeartIcon size={20} className={`transition ${liked ? "text-red-500 fill-red-500" : "text-gray-500"}`}/>
                          <span>{memorie.likes?.length || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 font-semibold hover:text-blue-500 transition" onClick={() => openCommentsModal(memorie)}>
                          <MessageCircle size={20}/>
                          <span>{memorie.comments?.length || 0} comentários</span>
                        </button>
                        <button onClick={() => navigate(`/compartilharpage/${chaveId}`)} className="flex items-center space-x-1 font-semibold hover:text-green-500 transition">
                          <Share size={20}/>
                          <span>Compartilhar</span>
                        </button>
                      </div>
                    </motion.div>
                  )
                }

                // Medium / Small
                return (
                  <div key={memorie.id} className="relative overflow-hidden rounded-lg cursor-pointer group h-28 sm:h-36" onClick={() => openCommentsModal(memorie)}>
                    {VIDEO_EXTENSIONS.includes(ext)
                      ? <video src={memorie.file_url} autoPlay loop muted className="w-full h-full object-cover"/>
                      : <img src={memorie.file_url} alt={`Memória ${memorie.id}`} className="w-full h-full object-cover transition-transform group-hover:scale-105"/>
                    }
                    <div className="absolute top-1 right-1 bg-black/50 p-1 rounded-full">
                      {memorie.privacy === "private" ? <Lock size={14} className="text-white"/> : <Globe size={14} className="text-white"/>}
                    </div>
                  </div>
                )
              })}
            </motion.div>
        }
      </main>

      {/* Modal Comentários */}
      <AnimatePresence>
        {commentModalMemory && (
          <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-end z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full h-full relative p-4 flex flex-col" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <button className="absolute top-4 right-4 font-bold text-2xl text-white" onClick={closeCommentsModal}>&times;</button>
              <h2 className="font-bold text-lg mb-4 text-white">Comentários</h2>
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 text-white">
                {commentModalMemory.comments?.map((comment) => (
                  <div key={comment.id} className="flex items-center space-x-2">
                    <img src={comment.user.avatar_url || "/default-avatar.png"} alt={comment.user.username} className="w-8 h-8 rounded-full"/>
                    <div><span className="font-bold">{comment.user.username}:</span> {comment.content}</div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input type="text" placeholder="Adicione um comentário..." className="flex-1 p-3 rounded-2xl border border-border dark:border-border-dark bg-background dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark text-white" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddComment(commentModalMemory.id)} />
                <button className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-2xl font-bold hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition" onClick={() => handleAddComment(commentModalMemory.id)}>Enviar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MinhasMemoriasPage
