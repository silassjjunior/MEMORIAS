import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useChave } from "@/contexts/ChaveContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart as HeartIcon,
  MessageCircle,
  LayoutList,
  LayoutGrid,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

// SuasMemorias.jsx — versão final: suporte a vídeos com autoplay inteligente
const VIDEO_EXTS = ["mp4", "mov", "webm", "ogg", "m4v"];
const isVideo = (url) => {
  if (!url) return false;
  try {
    const lower = url.split("?")[0].toLowerCase();
    return VIDEO_EXTS.some((ext) => lower.endsWith("." + ext));
  } catch (e) {
    return false;
  }
};

const SuasMemorias = () => {
  const { user } = useAuth();
  const { chaveSelecionada } = useChave();
  const { chaveId: paramChaveId } = useParams();
  const navigate = useNavigate();

  const [chaveId, setChaveId] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("full");
  const [viewModeMenuOpen, setViewModeMenuOpen] = useState(false);
  const [commentModalMemory, setCommentModalMemory] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [eventData, setEventData] = useState({ name: "Evento Desconhecido", design_url: null });
  const [chaveInfo, setChaveInfo] = useState(null);
  const commentsInterval = useRef(null);
  const controls = useAnimation();
  const lastScrollY = useRef(0);

  // refs para vídeos (grid + full)
  const videoRefs = useRef({}); // { [memorieId]: HTMLVideoElement }

  // --- Header scroll hide ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        controls.start({ y: "-100%", transition: { duration: 0.3 } });
      } else {
        controls.start({ y: "0%", transition: { duration: 0.3 } });
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  // --- Fetch memórias e dados da chave/evento ---
  useEffect(() => {
    if (!user) return;
    fetchMemories();
    return () => clearInterval(commentsInterval.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, chaveSelecionada, paramChaveId]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const mainChaveId = paramChaveId || chaveSelecionada;
      if (!mainChaveId) {
        console.warn("Nenhuma chave selecionada.");
        setLoading(false);
        return;
      }
      setChaveId(mainChaveId);

      const { data: chaveData, error: chaveError } = await supabase
        .from("chaves")
        .select(`
          id,
          serial_number,
          criado_por,
          event_id,
          Users!chaves_owner_id_fkey(username, avatar_url)
        `)
        .eq("id", mainChaveId)
        .single();
      if (chaveError) throw chaveError;

      setChaveInfo({
        ...chaveData,
        creator_name: chaveData.Users?.username,
        creator_avatar: chaveData.Users?.avatar_url,
      });

      const { data: memoriesData, error: memoriesError } = await supabase
        .from("memories")
        .select(`
          id,
          file_url,
          created_at,
          uploader: uploader_id(id, username, avatar_url),
          comments(id, content, created_at, user: user_id(id, username, avatar_url)),
          likes(id, user_id)
        `)
        .eq("chave_id", mainChaveId)
        .eq("privacy", "public")
        .order("created_at", { ascending: false });
      if (memoriesError) throw memoriesError;

      // Inicializar memory.aspect (mantém se já existir)
      const formatted = (memoriesData || []).map((m) => ({ ...m, aspect: m.aspect || "square" }));
      setMemories(formatted);

      if (chaveData?.event_id) {
        const { data: eventDataResp } = await supabase.from("events").select("name, design_url").eq("id", chaveData.event_id).single();
        if (eventDataResp) setEventData(eventDataResp);
      }
    } catch (err) {
      console.error("Erro ao buscar memórias:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Comments fetch ---
  const fetchCommentsForMemory = async (memoryId) => {
    const { data, error } = await supabase
      .from("comments")
      .select(`id, content, created_at, user: user_id(id, username, avatar_url)`)
      .eq("memorie_id", memoryId)
      .order("created_at", { ascending: true });
    if (!error) setCommentModalMemory((prev) => ({ ...prev, comments: data }));
  };

  const handleAddComment = async (memoryId) => {
    if (!user || !newComment.trim()) return;
    try {
      await supabase.from("comments").insert({ content: newComment, memorie_id: memoryId, user_id: user.id, created_at: new Date().toISOString() });
      setNewComment("");
      fetchCommentsForMemory(memoryId);
      fetchMemories();
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err);
    }
  };

  const handleToggleLike = async (memoryId, liked) => {
    if (!user) return;
    try {
      if (liked) await supabase.from("likes").delete().eq("user_id", user.id).eq("memorie_id", memoryId);
      else await supabase.from("likes").insert({ user_id: user.id, memorie_id: memoryId });
      fetchMemories();
    } catch (err) {
      console.error("Erro ao atualizar like:", err);
    }
  };

  const openCommentsModal = (memorie) => {
    setCommentModalMemory(memorie);
    fetchCommentsForMemory(memorie.id);
    commentsInterval.current = setInterval(() => fetchCommentsForMemory(memorie.id), 3000);
  };
  const closeCommentsModal = () => {
    setCommentModalMemory(null);
    clearInterval(commentsInterval.current);
  };

  const getGridClasses = () => {
    switch (viewMode) {
      case "medium":
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2";
      case "small":
        return "grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-1";
      default:
        return "flex flex-col space-y-6";
    }
  };

  const renderViewModeIcon = (mode) => {
    switch (mode) {
      case "medium":
        return <LayoutGrid size={14} />;
      case "small":
        return <LayoutDashboard size={14} />;
      default:
        return <LayoutList size={14} />;
    }
  };

  // --- AutoPlay inteligente: só tocar vídeo que está visível (e pausar os outros)
  useEffect(() => {
    if (!memories || memories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const vid = entry.target;
          if (!vid || vid.tagName !== "VIDEO") return;
          if (entry.isIntersecting) {
            // Pausa todos os outros vídeos
            Object.values(videoRefs.current).forEach((v) => {
              if (v && v !== vid) {
                try {
                  v.pause();
                } catch (e) {}
              }
            });
            // Play no visível
            vid.play().catch(() => {});
          } else {
            try {
              vid.pause();
            } catch (e) {}
          }
        });
      },
      { threshold: 0.6 }
    );

    // observar todos os vídeos registrados
    Object.values(videoRefs.current).forEach((v) => v && observer.observe(v));

    return () => observer.disconnect();
  }, [memories]);

  // Toggle mute control para o vídeo full
  const toggleMute = (id) => {
    const v = videoRefs.current[id];
    if (!v) return;
    v.muted = !v.muted;
    try { v.play(); } catch (e) {}
  };

  // Helper: detectar e salvar proporção após carregamento
  const markAspectFromVideo = (id, videoEl) => {
    if (!videoEl) return;
    const aspect = videoEl.videoWidth / videoEl.videoHeight;
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, aspect: aspect > 1.2 ? "horizontal" : aspect < 0.9 ? "vertical" : "square" } : m)));
  };
  const markAspectFromImage = (id, imgEl) => {
    if (!imgEl) return;
    const aspect = imgEl.naturalWidth / imgEl.naturalHeight;
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, aspect: aspect > 1.2 ? "horizontal" : aspect < 0.9 ? "vertical" : "square" } : m)));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <motion.header animate={controls} className="bg-card shadow-sm p-4 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground shrink-0">
            <ArrowLeft size={24} />
          </button>

          {eventData.design_url ? (
            <img src={eventData.design_url} alt="Banner" className="w-12 h-12 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 bg-gray-400 rounded-full shrink-0" />
          )}

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-2xl font-bold leading-tight">{eventData.name}</h1>

            {chaveInfo && (
              <div className="flex items-center mt-1 text-sm text-muted-foreground space-x-2">
                {chaveInfo.creator_avatar && <img src={chaveInfo.creator_avatar} alt={chaveInfo.creator_name} className="w-6 h-6 rounded-full object-cover" />}
                <span>
                  Memórias de <span className="font-semibold text-primary">{chaveInfo.creator_name}</span>
                </span>
              </div>
            )}

            {chaveInfo?.serial_number && <div className="mt-1 text-xs text-muted-foreground">{chaveInfo.serial_number}</div>}
          </div>
        </div>
      </motion.header>

      {/* Botão flutuante viewMode */}
      <div className="fixed top-20 right-4 z-40">
        <div className="relative">
          <button onClick={() => setViewModeMenuOpen(!viewModeMenuOpen)} className="p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/80 transition" title="Mudar visualização">
            {renderViewModeIcon(viewMode)}
          </button>

          {viewModeMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-2 flex flex-col bg-card p-2 rounded-xl shadow-lg z-50">
              {["full", "medium", "small"].map((mode) => (
                <button key={mode} onClick={() => { setViewMode(mode); setViewModeMenuOpen(false); }} className="p-2 rounded hover:bg-muted-foreground/10 flex items-center justify-center">
                  {renderViewModeIcon(mode)}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <main className="flex-1 p-4">
        {loading ? (
          <p className="text-center text-muted-foreground animate-pulse">Carregando memórias...</p>
        ) : memories.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhuma memória pública encontrada.</p>
        ) : (
          <motion.div className={getGridClasses()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {memories.map((memorie) => {
              const liked = memorie.likes?.some((like) => like.user_id === user?.id);
              const fileIsVideo = isVideo(memorie.file_url);

              // aspect class like Feed
              const aspectClass = memorie.aspect === "horizontal" ? "aspect-video" : memorie.aspect === "vertical" ? "aspect-[9/16]" : "aspect-square";

              if (viewMode === "full") {
                return (
                  <motion.div key={memorie.id} layout className="p-4 bg-card rounded-2xl shadow transition-transform hover:scale-[1.01]">
                    <div className="flex items-center mb-2">
                      <img src={memorie.uploader.avatar_url || "/default-avatar.png"} alt={memorie.uploader.username} className="w-10 h-10 rounded-full mr-3" />
                      <div>
                        <div className="font-semibold">{memorie.uploader.username}</div>
                        <div className="text-xs text-gray-500">{new Date(memorie.created_at).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className={`w-full ${aspectClass} overflow-hidden rounded-2xl mb-2 bg-black`}>
                      {fileIsVideo ? (
                        <video
                          ref={(el) => { videoRefs.current[memorie.id] = el; }}
                          src={memorie.file_url}
                          autoPlay
                          muted
                          controls
                          playsInline
                          loop
                          preload="metadata"
                          onLoadedMetadata={(e) => markAspectFromVideo(memorie.id, e.target)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={memorie.file_url}
                          alt="Memória"
                          className="w-full h-full object-cover"
                          onLoad={(e) => markAspectFromImage(memorie.id, e.target)}
                        />
                      )}

                      {fileIsVideo && (
                        <button onClick={() => toggleMute(memorie.id)} className="absolute bottom-5 right-5 bg-black/50 text-white p-2 rounded-full" title="Ativar/desativar som">🔊</button>
                      )}
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground items-center mt-2">
                      <button className="flex items-center space-x-1" onClick={() => handleToggleLike(memorie.id, liked)}>
                        <HeartIcon size={20} className={`transition ${liked ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                        <span>{memorie.likes?.length || 0}</span>
                      </button>

                      <button className="flex items-center space-x-1 font-semibold hover:text-blue-500 transition" onClick={() => openCommentsModal(memorie)}>
                        <MessageCircle size={20} />
                        <span>{memorie.comments?.length || 0}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              }

              // compact grid items
              return (
                <div key={memorie.id} className={`relative overflow-hidden rounded-lg cursor-pointer group ${viewMode === "medium" ? "h-44" : "h-28 sm:h-36"}`} onClick={() => openCommentsModal(memorie)}>
                  <div className={`w-full ${aspectClass} overflow-hidden`}> 
                    {fileIsVideo ? (
                      <video
                        ref={(el) => { videoRefs.current[memorie.id] = el; }}
                        src={memorie.file_url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(e) => markAspectFromVideo(memorie.id, e.target)}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <img
                        src={memorie.file_url}
                        alt={`Memória ${memorie.id}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onLoad={(e) => markAspectFromImage(memorie.id, e.target)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* Modal de Comentários + preview */}
      <AnimatePresence>
        {commentModalMemory && (
          <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-end z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full h-full relative p-4 flex flex-col" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <button className="absolute top-4 right-4 font-bold text-2xl text-white" onClick={closeCommentsModal}>&times;</button>

              {/* Preview */}
              <div className="mb-4 w-full max-h-[72vh]">
                {isVideo(commentModalMemory.file_url) ? (
                  <video src={commentModalMemory.file_url} autoPlay muted controls playsInline loop className="w-full h-full object-cover rounded-2xl bg-black" />
                ) : (
                  <img src={commentModalMemory.file_url} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                )}
              </div>

              <h2 className="font-bold text-lg mb-4 text-white">Comentários</h2>

              <div className="flex-1 overflow-y-auto mb-4 space-y-3 text-white">
                {commentModalMemory.comments?.map((comment) => (
                  <div key={comment.id} className="flex items-center space-x-2">
                    <img src={comment.user.avatar_url || "/default-avatar.png"} alt={comment.user.username} className="w-8 h-8 rounded-full" />
                    <div>
                      <span className="font-bold">{comment.user.username}:</span> {comment.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input type="text" placeholder="Adicione um comentário..." className="flex-1 p-3 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-white" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddComment(commentModalMemory.id)} />
                <button className="px-4 py-2 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition" onClick={() => handleAddComment(commentModalMemory.id)}>Enviar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuasMemorias;
