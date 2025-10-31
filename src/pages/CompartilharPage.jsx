import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

const CompartilharPage = () => {
  const { user } = useAuth()
  const { chaveId } = useParams()
  const [memories, setMemories] = useState([])
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [legenda, setLegenda] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // --- 🎞️ Buscar memórias públicas da chave atual
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from("memories")
          .select("id, file_url, legenda")
          .eq("chave_id", chaveId)
          .eq("privacy", "public")

        if (error) throw error
        setMemories(data || [])
      } catch (err) {
        console.error("Erro ao carregar memórias públicas:", err)
      }
    }

    fetchMemories()
  }, [chaveId])

  // --- 🚀 Compartilhar memória selecionada
  const handleShare = async () => {
    if (!selectedMemory) return alert("Selecione uma mídia para compartilhar!")
    setLoading(true)

    try {
      await supabase
        .from("memories")
        .update({
          shared_to_event: true,
          compartilhado_em: new Date().toISOString(),
          legenda,
        })
        .eq("id", selectedMemory.id)

      navigate(`/feedgeral/${chaveId}`)
    } catch (err) {
      console.error("Erro ao compartilhar:", err)
    } finally {
      setLoading(false)
    }
  }

  // --- 🧠 Função utilitária para detectar vídeos
  const isVideo = (url) => {
    const ext = url?.split(".").pop()?.toLowerCase()
    return ["mp4", "mov", "webm", "ogg"].includes(ext)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
      {/* --- Cabeçalho --- */}
      <header className="bg-card dark:bg-card-dark shadow-sm p-4 flex items-center space-x-4 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-foreground dark:text-foreground hover:text-primary transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-md font-bold">
          Escolha uma das suas memórias públicas para compartilhar
        </h1>
      </header>

      {/* --- Conteúdo Principal --- */}
      <main className="flex-1 p-4 flex flex-col space-y-4">
        {!selectedMemory ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {memories.length === 0 && (
              <p className="text-muted-foreground text-center col-span-full">
                Nenhuma mídia pública disponível.
              </p>
            )}

            {memories.map((mem) => (
              <div
                key={mem.id}
                onClick={() => setSelectedMemory(mem)}
                className="relative cursor-pointer rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all"
              >
                {isVideo(mem.file_url) ? (
                  <video
                    src={mem.file_url}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <img
                    src={mem.file_url}
                    alt={mem.legenda}
                    className="w-full h-40 object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {/* Preview selecionado */}
            <div className="w-full h-72 sm:h-96 overflow-hidden rounded-2xl shadow-md bg-black flex items-center justify-center">
              {isVideo(selectedMemory.file_url) ? (
                <video
                  src={selectedMemory.file_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={selectedMemory.file_url}
                  alt="Selecionada"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Campo de legenda */}
            <textarea
              placeholder="Escreva uma legenda..."
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              className="w-full p-4 rounded-2xl border border-border dark:border-border-dark resize-none
                         bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark
                         focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark"
            />

            {/* Botão para voltar à seleção */}
            <button
              onClick={() => setSelectedMemory(null)}
              className="self-start text-primary font-medium hover:underline transition"
            >
              Escolher outra mídia
            </button>
          </div>
        )}
      </main>

      {/* --- Rodapé (botão de compartilhar) --- */}
      {selectedMemory && (
        <footer className="sticky bottom-0 w-full p-4 bg-card dark:bg-card-dark shadow-md mb-10">
          <button
            onClick={handleShare}
            disabled={loading}
            className="w-full bg-primary dark:bg-primary-dark text-white py-4 rounded-2xl font-bold
                       hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition disabled:opacity-50"
          >
            {loading ? "Compartilhando..." : "Compartilhar"}
          </button>
        </footer>
      )}
    </div>
  )
}

export default CompartilharPage
