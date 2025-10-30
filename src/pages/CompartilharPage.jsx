import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const CompartilharPage = () => {
  const { user } = useAuth()
  const { chaveId } = useParams()
  const [memories, setMemories] = useState([])
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [legenda, setLegenda] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Buscar imagens públicas da chave atual
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('id, file_url, legenda')
          .eq('chave_id', chaveId)
          .eq('privacy', 'public')

        if (error) throw error
        setMemories(data)
      } catch (err) {
        console.error('Erro ao carregar imagens do evento:', err)
      }
    }
    fetchMemories()
  }, [chaveId])

  const handleShare = async () => {
    if (!selectedMemory) return alert('Selecione uma imagem para compartilhar!')
    setLoading(true)
    try {
      await supabase
        .from('memories')
        .update({
          shared_to_event: true,
          compartilhado_em: new Date().toISOString(),
          legenda,
        })
        .eq('id', selectedMemory.id)

      navigate(`/feedgeral/${chaveId}`)
    } catch (err) {
      console.error('Erro ao compartilhar:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Cabeçalho */}
      <header className="bg-card shadow-sm p-4 flex items-center space-x-4 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-foreground hover:text-primary transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-md font-bold">Escolha uma das suas memorias Publicas para Compartilhar</h1>
      </header>

      {/* Seleção ou Preview */}
      <main className="flex-1 p-4 flex flex-col space-y-4">
        {!selectedMemory ? (
          <div className="grid grid-cols-3 gap-2">
            {memories.length === 0 && <p>Nenhuma imagem pública disponível.</p>}
            {memories.map((mem) => (
              <img
                key={mem.id}
                src={mem.file_url}
                alt={mem.legenda}
                className="w-full h-32 object-cover rounded-lg cursor-pointer border-2 hover:border-primary transition"
                onClick={() => setSelectedMemory(mem)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {/* Preview grande da imagem */}
            <div className="w-full h-72 sm:h-96 overflow-hidden rounded-2xl shadow-md">
              <img
                src={selectedMemory.file_url}
                alt="Selecionada"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Legenda */}
            <textarea
              placeholder="Escreva uma legenda..."
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              className="w-full p-4 rounded-2xl border border-border resize-none
                         bg-background text-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Selecionar outra imagem */}
            <button
              onClick={() => setSelectedMemory(null)}
              className="self-start text-primary font-medium hover:underline"
            >
              Escolher outra imagem
            </button>
          </div>
        )}
      </main>

      {/* Botão fixo de compartilhar */}
      {selectedMemory && (
        <footer className="sticky bottom-0 w-full p-4 bg-card shadow-md mb-12">
          <button
            onClick={handleShare}
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold
                       hover:bg-primary-hover transition disabled:opacity-50"
          >
            {loading ? 'Compartilhando...' : 'Compartilhar'}
          </button>
        </footer>
      )}
    </div>
  )
}

export default CompartilharPage
