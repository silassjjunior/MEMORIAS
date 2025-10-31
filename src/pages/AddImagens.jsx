import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const AddImagens = () => {
  const { chaveId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [privacy, setPrivacy] = useState('private')
  const [eventId, setEventId] = useState(null)

  useEffect(() => {
    const fetchEventId = async () => {
      if (!chaveId) return
      const { data: chaveData, error } = await supabase
        .from('chaves')
        .select('event_id')
        .eq('id', chaveId)
        .single()
      if (error) console.error('Erro ao buscar chave:', error)
      else setEventId(chaveData.event_id)
    }
    fetchEventId()
  }, [chaveId])

  // ⚡ Limpar Object URLs ao trocar arquivos
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview))
    }
  }, [files])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setFiles(selectedFiles)
  }

  const handleUpload = async () => {
    if (!files.length) {
      alert('Selecione ao menos um arquivo!')
      return
    }
    if (!eventId) {
      alert('Não foi possível determinar o evento da chave.')
      return
    }

    setIsUploading(true)
    setStatusMessage(`Enviando ${files.length} arquivo(s)...`)

    try {
      for (let i = 0; i < files.length; i++) {
        const { file } = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${i}.${fileExt}`
        const filePath = `${user.id}/${privacy}/${fileName}`

        // Upload no bucket
        const { error: uploadError } = await supabase.storage
          .from('memories_bucket')
          .upload(filePath, file)
        if (uploadError) throw uploadError

        // Gerar URL pública
        const { data: urlData } = supabase.storage
          .from('memories_bucket')
          .getPublicUrl(filePath)
        const publicUrl = urlData.publicUrl

        // Inserir na tabela memories
        const { error: insertError } = await supabase
          .from('memories')
          .insert([{
            chave_id: chaveId,
            uploader_id: user.id,
            file_url: publicUrl,
            type: fileExt,
            privacy,
            legenda: null,
            event_id: eventId
          }])
        if (insertError) throw insertError
      }

      setStatusMessage('✅ Upload finalizado!')
      setFiles([])
    } catch (err) {
      console.error('Erro no upload:', err.message)
      setStatusMessage('❌ Erro ao enviar arquivos')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background dark:bg-background-dark p-6 pt-16 text-foreground dark:text-foreground-dark">
      <h1 className="text-2xl font-bold mb-6 text-center">Upload de Arquivos</h1>

      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="fileInput"
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer bg-primary dark:bg-primary-dark text-white px-6 py-3 rounded-lg shadow hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition"
      >
        Selecionar Arquivos
      </label>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {files.map((f, idx) => (
            <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md">
              {f.file.type.startsWith('image/') ? (
                <img src={f.preview} alt={`preview-${idx}`} className="w-full h-full object-cover"/>
              ) : (
                <video src={f.preview} controls className="w-full h-full object-cover"/>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 flex space-x-4">
          <button
            className={`px-4 py-2 rounded-lg flex-1 ${
              privacy==='private'
                ? 'bg-gray-800 dark:bg-gray-700 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setPrivacy('private')}
          >
            Privado
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex-1 ${
              privacy==='public'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setPrivacy('public')}
          >
            Público
          </button>
        </div>
      )}

      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-6 w-full max-w-xs bg-primary dark:bg-primary-dark text-white px-6 py-3 rounded-lg shadow hover:bg-primary-hover dark:hover:bg-primary-hover-dark transition disabled:opacity-50"
        >
          {isUploading ? 'Enviando...' : 'Enviar Arquivos'}
        </button>
      )}

      {statusMessage && (
        <div className="mt-4 font-semibold text-center">
          {statusMessage}
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-6 text-muted-foreground dark:text-muted-foreground-dark hover:text-foreground dark:hover:text-foreground-dark transition"
      >
        Voltar
      </button>
    </div>
  )
}

export default AddImagens
