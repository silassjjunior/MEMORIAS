import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Schema de validação com Zod
const cadastroSchema = z.object({
  username: z.string().min(3, 'Usuário deve ter no mínimo 3 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export default function CadastroPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cadastroSchema),
  })

  const onSubmit = async ({ username, email, password }) => {
    setError('')
    setLoading(true)

    try {
      // 1️⃣ Cria usuário no Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      })
      if (signUpError) throw signUpError

      const user = data.user
      if (!user) throw new Error('Erro ao criar usuário')

      // 2️⃣ Upsert na tabela Users (evita conflito de email)
      const { error: upsertError } = await supabase
        .from('Users')
        .upsert(
          [
            {
              id: user.id,
              email,
              username,
              avatar_url: '',
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { onConflict: 'email' } // evita erro de email duplicado
        )
      if (upsertError) throw upsertError

      // 3️⃣ Loga usuário no contexto sem exigir email confirmado
      setUser(user)

      // 4️⃣ Redireciona para home/dashboard
      navigate('/dashboard')
    } catch (err) {
      console.error('Erro ao criar conta:', err)
      setError(err?.message || 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md w-full max-w-sm space-y-4 transition-colors"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Criar Conta
        </h1>

        {/* Usuário */}
        <div className="space-y-1">
          <Label htmlFor="username">Usuário</Label>
          <Input
            id="username"
            placeholder="Seu usuário"
            {...register('username')}
            className={errors.username ? 'border-red-500' : ''}
            disabled={loading}
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
            disabled={loading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Senha */}
        <div className="space-y-1 relative">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
            className={`pr-12 ${errors.password ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Erro */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Botão */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold h-12 rounded-lg shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Conta'
          )}
        </Button>

        {/* Link para login */}
        <p className="text-center text-sm mt-2 text-gray-600 dark:text-gray-400">
          Já tem conta?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-purple-600 dark:text-purple-400 cursor-pointer hover:underline"
          >
            Faça login
          </span>
        </p>
      </form>
    </div>
  )
}
