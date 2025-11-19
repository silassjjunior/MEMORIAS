import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import jsQR from 'jsqr'
import { motion } from 'framer-motion'
import ParticleEffect from '@/components/ParticleEffect'

const AddNovaChave = () => {
  const { user } = useAuth()
  const [prefixoEvento, setPrefixoEvento] = useState('')
  const [erro, setErro] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imagemEvento, setImagemEvento] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const scanRef = useRef(null)

  // Ativar/desativar câmera
  useEffect(() => {
    if (cameraActive) startCamera()
    else stopCamera()
    return () => stopCamera()
  }, [cameraActive])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        requestAnimationFrame(scanQRCode)
      }
    } catch (err) {
      console.error(err)
      setErro('Não foi possível acessar a câmera')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    cancelAnimationFrame(scanRef.current)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Proteção contra videoWidth = 0
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    if (canvas.width === 0 || canvas.height === 0) {
      scanRef.current = requestAnimationFrame(scanQRCode)
      return
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      setPrefixoEvento(code.data)
      stopCamera()
    } else {
      scanRef.current = requestAnimationFrame(scanQRCode)
    }
  }

  // Criar chave
  const handleAddChave = async () => {
    setErro('')
    if (!prefixoEvento) {
      setErro('Digite ou escaneie o prefixo do evento')
      return
    }

    setLoading(true)
    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, event_code_prefix, key_count, max_chaves, design_url')
        .eq('event_code_prefix', prefixoEvento)
        .maybeSingle()

      if (eventError || !event) {
        setErro('Evento não encontrado')
        setLoading(false)
        return
      }

      if (event.key_count >= event.max_chaves) {
        setErro('Não há mais chaves disponíveis para este evento')
        setLoading(false)
        return
      }

      const { data: existingKey } = await supabase
        .from('chaves')
        .select('id')
        .eq('event_id', event.id.toString())
        .eq('criado_por', user.id.toString())
        .maybeSingle()

      if (existingKey) {
        setErro('Você já criou uma chave para este evento')
        setLoading(false)
        return
      }

      const serial_number = `${event.event_code_prefix}#${event.key_count + 1}`

      const { error: chaveError } = await supabase.from('chaves').insert([
        {
          event_id: event.id,
          owner_id: user.id,
          criado_por: user.id,
          serial_number,
        },
      ])
      if (chaveError) throw chaveError

      const { error: rpcError } = await supabase.rpc('increment_key_count', {
        event_id: event.id,
      })
      if (rpcError) throw rpcError

      setImagemEvento(event.design_url)
      setPrefixoEvento('')
    } catch (err) {
      console.error(err)
      setErro('Erro ao criar a chave')
    } finally {
      setLoading(false)
    }
  }

  // Voltar da tela de animação
  const handleVoltar = () => {
    setImagemEvento(null)
    setErro('')
    stopCamera()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Cabeçalho */}
      <header className="p-4 bg-card shadow-md flex justify-between items-center z-20">
        <h1 className="text-xl font-bold text-primary">Adicionar Nova Chave</h1>
        {!imagemEvento && (
          <Button
            onClick={() => setCameraActive(!cameraActive)}
            size="sm"
            variant={cameraActive ? 'destructive' : 'default'}
          >
            {cameraActive ? 'Fechar Câmera' : 'Abrir Câmera'}
          </Button>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {!imagemEvento ? (
          <motion.div
            className="w-full space-y-4 max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <input
              type="text"
              placeholder="Digite ou escaneie o prefixo do evento"
              value={prefixoEvento}
              onChange={(e) => setPrefixoEvento(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddChave()}
              className="w-full p-3 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />

            <Button className="w-full" onClick={handleAddChave} disabled={loading}>
              {loading ? 'Criando...' : 'OK'}
            </Button>

            {erro && <p className="mt-2 text-destructive font-medium">{erro}</p>}
          </motion.div>
        ) : (
          <motion.div
            className="relative w-full h-[80vh] flex flex-col items-center justify-center space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <ParticleEffect imageUrl={imagemEvento} />
            <Button variant="secondary" onClick={handleVoltar} className="z-20">
              Voltar
            </Button>
          </motion.div>
        )}
      </main>

      {/* Câmera */}
      {cameraActive && !imagemEvento && (
        <div className="flex-1 p-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-80 rounded-lg border border-border object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  )
}

export default AddNovaChave
