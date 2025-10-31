import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useChave } from "@/contexts/ChaveContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Heart, MessageCircle, X } from "lucide-react";

const Favoritos = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentMemory, setCommentMemory] = useState(null);
  const [zoomMemory, setZoomMemory] = useState(null);

  const { chaveSelecionada } = useChave();
  const navigate = useNavigate();

  // --- Buscar dados e verificar admin
  useEffect(() => {
    const fetchData = async () => {
      if (!chaveSelecionada) return;

      try {
        setLoading(true);

        const { data: chaveData } = await supabase
          .from("chaves")
          .select("event_id, is_admin")
          .eq("id", chaveSelecionada)
          .single();

        setIsAdmin(!!chaveData?.is_admin);

        const { data: favs } = await supabase
          .from("memories")
          .select(`
            id,
            file_url,
            legenda,
            created_at,
            uploader:uploader_id(id, username, avatar_url),
            likes:likes(id, user_id),
            comments:comments(id, content, created_at, user:user_id(id, username, avatar_url))
          `)
          .eq("event_id", chaveData.event_id)
          .eq("featured", true)
          .order("created_at", { ascending: false });

        setMemories(favs || []);
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chaveSelecionada]);

  // --- Curtir / descurtir
  const toggleLike = async (memory) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return alert("Faça login para curtir.");

    const liked = memory.likes?.some((like) => like.user_id === user.id);

    try {
      if (liked) {
        await supabase.from("likes").delete().eq("memorie_id", memory.id).eq("user_id", user.id);
      } else {
        await supabase.from("likes").insert({ memorie_id: memory.id, user_id: user.id });
      }

      setMemories((prev) =>
        prev.map((m) =>
          m.id === memory.id
            ? {
                ...m,
                likes: liked
                  ? m.likes.filter((l) => l.user_id !== user.id)
                  : [...(m.likes || []), { user_id: user.id }],
              }
            : m
        )
      );
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  };

  // --- Adicionar comentário
  const addComment = async () => {
    if (!newComment.trim() || !commentMemory) return;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return alert("Faça login para comentar.");

    try {
      const { data } = await supabase
        .from("comments")
        .insert({
          memorie_id: commentMemory.id,
          user_id: user.id,
          content: newComment,
        })
        .select(`id, content, created_at, user:user_id(id, username, avatar_url)`)
        .single();

      setMemories((prev) =>
        prev.map((m) =>
          m.id === commentMemory.id
            ? { ...m, comments: [...(m.comments || []), data] }
            : m
        )
      );

      setNewComment("");
      setCommentMemory(null);
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err);
    }
  };

  // --- Detectar tipo de mídia
  const isVideo = (url) => {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark flex flex-col items-center transition-colors duration-300">
      
      {/* Botão Editar Admin */}
      {isAdmin && (
        <div className="w-full flex justify-end p-4">
          <button
            onClick={() => navigate(`/curadoriapage/${chaveSelecionada}`)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-2xl hover:bg-primary/80 transition"
          >
            <Edit3 size={16} />
            <span>Editar Favoritos</span>
          </button>
        </div>
      )}

      {/* Feed */}
      <main className="flex-1 w-full flex flex-col items-center gap-8 pb-8">
        {loading ? (
          <p className="text-center animate-pulse mt-10">Carregando favoritos...</p>
        ) : memories.length === 0 ? (
          <p className="text-center text-muted-foreground mt-10">
            Nenhuma foto favorita encontrada.
          </p>
        ) : (
          memories.map((memory) => (
            <motion.div
              key={memory.id}
              className="w-full max-w-4xl bg-card dark:bg-card-dark rounded-xl shadow overflow-hidden cursor-pointer"
              layout
              onClick={() => setZoomMemory(memory)}
            >
              {/* Mídia adaptativa */}
              {isVideo(memory.file_url) ? (
                <video
                  src={memory.file_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto max-h-[90vh] object-contain"
                />
              ) : (
                <img
                  src={memory.file_url}
                  alt={memory.legenda || "Imagem"}
                  className="w-full h-auto max-h-[90vh] object-contain"
                />
              )}

              {/* Legenda e interações */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={memory.uploader?.avatar_url || "/default-avatar.png"}
                      alt={memory.uploader?.username || "Usuário"}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-semibold text-sm">
                      {memory.uploader?.username || "Anônimo"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(memory.created_at).toLocaleDateString()}
                  </span>
                </div>

                {memory.legenda && <p className="text-sm mb-3">{memory.legenda}</p>}

                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(memory); }}
                    className="flex items-center gap-1"
                  >
                    <Heart
                      className={`${
                        memory.likes?.length > 0
                          ? "text-red-500 fill-red-500"
                          : "text-foreground"
                      } transition`}
                      size={20}
                    />
                    <span className="text-sm">{memory.likes?.length || 0}</span>
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); setCommentMemory(memory); }}
                    className="flex items-center gap-1"
                  >
                    <MessageCircle size={20} />
                    <span className="text-sm">{memory.comments?.length || 0}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </main>

      {/* Modal Zoom */}
      <AnimatePresence>
        {zoomMemory && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomMemory(null)}
          >
            {isVideo(zoomMemory.file_url) ? (
              <video
                src={zoomMemory.file_url}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="max-h-[90vh] max-w-full object-contain rounded-lg"
              />
            ) : (
              <img
                src={zoomMemory.file_url}
                alt={zoomMemory.legenda || "Zoom"}
                className="max-h-[90vh] max-w-full object-contain rounded-lg"
              />
            )}
            <button
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={() => setZoomMemory(null)}
            >
              <X />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Comentário */}
      <AnimatePresence>
        {commentMemory && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-card dark:bg-card-dark rounded-lg w-full max-w-md p-4 relative">
              <h2 className="font-bold mb-3 text-lg">Comentários</h2>

              <div className="max-h-[50vh] overflow-y-auto space-y-3 mb-4">
                {(commentMemory.comments || []).map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <img
                      src={c.user?.avatar_url || "/default-avatar.png"}
                      alt={c.user?.username || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {c.user?.username || "Anônimo"}
                      </p>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg p-2 text-sm"
                  placeholder="Escreva um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  onClick={addComment}
                  className="bg-primary text-white px-4 rounded-lg"
                >
                  Enviar
                </button>
              </div>

              <button
                onClick={() => setCommentMemory(null)}
                className="absolute top-2 right-2 text-muted-foreground text-2xl"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Favoritos;
