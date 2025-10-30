import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/lib/supabase'
import { validateFile, formatFileSize, generateId } from '@/utils'
import { UPLOAD_CONFIG, MEMORY_PRIVACY } from '@/constants'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Check,
  AlertCircle
} from 'lucide-react'

const MemoryUpload = ({ 
  chaveId, 
  onUploadComplete, 
  onCancel,
  className = '' 
}) => {
  const { addNotification } = useApp()
  const [files, setFiles] = useState([])
  const [privacy, setPrivacy] = useState(MEMORY_PRIVACY.PRIVATE)
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Função para processar arquivos selecionados
  const processFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).map(file => {
      const validation = validateFile(file, UPLOAD_CONFIG)
      const fileType = file.type.startsWith('image/') ? 'image' : 'video'
      
      return {
        id: generateId(),
        file,
        type: fileType,
        preview: URL.createObjectURL(file),
        status: validation.isValid ? 'pending' : 'error',
        progress: 0,
        error: validation.errors.join(', ') || null
      }
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  // Handlers para drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files)
    }
  }, [processFiles])

  // Handler para seleção de arquivos
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files)
    }
  }

  // Remover arquivo da lista
  const removeFile = (fileId) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  // Upload de um arquivo individual
  const uploadFile = async (fileData) => {
    const { file, id } = fileData
    
    try {
      // Atualizar status para uploading
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'uploading', progress: 0 } : f
      ))

      // Gerar caminho único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `memories/${chaveId}/${fileName}`

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memories')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100
            setFiles(prev => prev.map(f => 
              f.id === id ? { ...f, progress: percentage } : f
            ))
          }
        })

      if (uploadError) throw uploadError

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('memories')
        .getPublicUrl(filePath)

      // Salvar metadados no banco de dados
      const { data: memoryData, error: dbError } = await supabase
        .from('memories')
        .insert({
          chave_id: chaveId,
          file_url: publicUrl,
          type: fileData.type,
          privacy: privacy,
          description: description || null
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Atualizar status para sucesso
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'success', progress: 100 } : f
      ))

      return memoryData
    } catch (error) {
      console.error('Erro no upload:', error)
      
      // Atualizar status para erro
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'error', error: error.message } : f
      ))
      
      throw error
    }
  }

  // Upload de todos os arquivos
  const handleUpload = async () => {
    const validFiles = files.filter(f => f.status === 'pending')
    
    if (validFiles.length === 0) {
      addNotification('Nenhum arquivo válido para upload', 'warning')
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = validFiles.map(uploadFile)
      const results = await Promise.allSettled(uploadPromises)
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      if (successful > 0) {
        addNotification(
          `${successful} memória${successful > 1 ? 's' : ''} enviada${successful > 1 ? 's' : ''} com sucesso!`,
          'success'
        )
      }

      if (failed > 0) {
        addNotification(
          `${failed} arquivo${failed > 1 ? 's' : ''} falharam no upload`,
          'error'
        )
      }

      // Chamar callback se todos os uploads foram bem-sucedidos
      if (failed === 0) {
        onUploadComplete?.()
      }
    } catch (error) {
      console.error('Erro geral no upload:', error)
      addNotification('Erro no upload das memórias', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />
      case 'video':
        return <Video className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upload de Memórias</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Área de upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Arraste e solte seus arquivos aqui
          </h3>
          <p className="text-gray-500 mb-4">
            ou clique para selecionar arquivos
          </p>
          
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Selecionar Arquivos
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="text-xs text-gray-400 mt-2">
            Máximo {formatFileSize(UPLOAD_CONFIG.maxFileSize)} por arquivo
          </p>
        </div>

        {/* Lista de arquivos */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Arquivos selecionados:</h4>
            
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                {/* Preview */}
                <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  {file.type === 'image' && file.preview ? (
                    <img 
                      src={file.preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>

                {/* Informações do arquivo */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file.size)} • {file.type}
                  </p>
                  
                  {/* Progress bar */}
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-1" />
                  )}
                  
                  {/* Erro */}
                  {file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>

                {/* Status e ações */}
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Configurações */}
        <div className="space-y-4">
          {/* Privacidade */}
          <div>
            <Label className="text-base font-medium">Privacidade</Label>
            <RadioGroup 
              value={privacy} 
              onValueChange={setPrivacy}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={MEMORY_PRIVACY.PRIVATE} id="private" />
                <Label htmlFor="private">
                  Privada (só você pode ver)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={MEMORY_PRIVACY.SHARED} id="shared" />
                <Label htmlFor="shared">
                  Compartilhada (outros donos do troféu podem ver)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição para suas memórias..."
              className="mt-1"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleUpload}
            disabled={files.filter(f => f.status === 'pending').length === 0 || isUploading}
          >
            {isUploading ? 'Enviando...' : 'Fazer Upload'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default MemoryUpload
