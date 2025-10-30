import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { isValidEmail, validatePassword } from '@/utils'
import { AUTH_PROVIDERS, TEXTS } from '@/constants'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const AuthForm = ({ mode = 'login', onModeChange }) => {
  const { signInWithProvider, signInWithEmail, signUpWithEmail, loading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLogin = mode === 'login'
  const texts = TEXTS.auth

  // Validação do formulário
  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (!isLogin) {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        const errorMessages = []
        if (passwordValidation.errors.minLength) errorMessages.push('mínimo 8 caracteres')
        if (passwordValidation.errors.hasUpperCase) errorMessages.push('uma letra maiúscula')
        if (passwordValidation.errors.hasLowerCase) errorMessages.push('uma letra minúscula')
        if (passwordValidation.errors.hasNumbers) errorMessages.push('um número')
        
        newErrors.password = `Senha deve conter: ${errorMessages.join(', ')}`
      }
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handler para mudança nos inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  // Handler para login/cadastro com email
  const handleEmailAuth = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      let result
      if (isLogin) {
        result = await signInWithEmail(formData.email, formData.password)
      } else {
        result = await signUpWithEmail(formData.email, formData.password, {
          username: formData.email.split('@')[0] // Username temporário baseado no email
        })
      }

      if (!result.success) {
        setErrors({ general: result.error.message })
      }
    } catch (error) {
      setErrors({ general: 'Erro inesperado. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler para login social
  const handleSocialAuth = async (provider) => {
    try {
      const result = await signInWithProvider(provider)
      if (!result.success) {
        setErrors({ general: result.error.message })
      }
    } catch (error) {
      setErrors({ general: 'Erro no login social. Tente novamente.' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? texts.loginTitle : texts.signupTitle}
          </h1>
          <p className="text-gray-600">
            {isLogin ? texts.loginSubtitle : texts.signupSubtitle}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Botões de login social */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              onClick={() => handleSocialAuth(AUTH_PROVIDERS.GOOGLE)}
              disabled={loading || isSubmitting}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {texts.continueWithGoogle}
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 text-base bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => handleSocialAuth(AUTH_PROVIDERS.FACEBOOK)}
              disabled={loading || isSubmitting}
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {texts.continueWithFacebook}
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 text-base bg-black text-white hover:bg-gray-800"
              onClick={() => handleSocialAuth(AUTH_PROVIDERS.APPLE)}
              disabled={loading || isSubmitting}
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C8.396 0 8.025.044 6.979.207 5.934.37 5.226.648 4.61 1.014c-.616.366-1.138.854-1.504 1.47C2.74 3.1 2.462 3.808 2.299 4.854 2.136 5.9 2.092 6.271 2.092 9.892s.044 3.992.207 5.038c.163 1.046.441 1.754.807 2.37.366.616.854 1.138 1.47 1.504.616.366 1.324.644 2.37.807 1.046.163 1.417.207 5.038.207s3.992-.044 5.038-.207c1.046-.163 1.754-.441 2.37-.807.616-.366 1.138-.854 1.504-1.47.366-.616.644-1.324.807-2.37.163-1.046.207-1.417.207-5.038s-.044-3.992-.207-5.038c-.163-1.046-.441-1.754-.807-2.37-.366-.616-.854-1.138-1.47-1.504C17.754 2.74 17.046 2.462 16 2.299 14.954 2.136 14.583 2.092 10.962 2.092zm0 1.855c3.539 0 3.96.015 5.36.078.904.041 1.395.191 1.723.318.433.168.742.369 1.067.694.325.325.526.634.694 1.067.127.328.277.819.318 1.723.063 1.4.078 1.821.078 5.36s-.015 3.96-.078 5.36c-.041.904-.191 1.395-.318 1.723-.168.433-.369.742-.694 1.067-.325.325-.634.526-1.067.694-.328.127-.819.277-1.723.318-1.4.063-1.821.078-5.36.078s-3.96-.015-5.36-.078c-.904-.041-1.395-.191-1.723-.318-.433-.168-.742-.369-1.067-.694-.325-.325-.526-.634-.694-1.067-.127-.328-.277-.819-.318-1.723-.063-1.4-.078-1.821-.078-5.36s.015-3.96.078-5.36c.041-.904.191-1.395.318-1.723.168-.433.369-.742.694-1.067.325-.325.634-.526 1.067-.694.328-.127.819-.277 1.723-.318 1.4-.063 1.821-.078 5.36-.078z"/>
              </svg>
              {texts.continueWithApple}
            </Button>
          </div>

          {/* Divisor */}
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-2 text-sm text-gray-500">
                {texts.orDivider}
              </span>
            </div>
          </div>

          {/* Formulário de email */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Erro geral */}
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={texts.emailPlaceholder}
                className={errors.email ? 'border-red-500' : ''}
                disabled={loading || isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={texts.passwordPlaceholder}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  disabled={loading || isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirmar senha (apenas no cadastro) */}
            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirme sua senha"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  disabled={loading || isSubmitting}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Botão de submit */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base"
              disabled={loading || isSubmitting}
            >
              {(loading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLogin ? texts.loginButton : texts.signupButton}
            </Button>
          </form>

          {/* Link para alternar modo */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? texts.noAccount : texts.hasAccount}{' '}
              <button
                type="button"
                onClick={() => onModeChange?.(isLogin ? 'signup' : 'login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
                disabled={loading || isSubmitting}
              >
                {isLogin ? texts.signupLink : texts.loginLink}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthForm
