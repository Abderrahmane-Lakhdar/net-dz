import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      
      // Gérer "Se souvenir de moi"
      if (rememberMe) {
        localStorage.setItem('creditpro_remember_email', email)
      } else {
        localStorage.removeItem('creditpro_remember_email')
      }
      
      toast.success('Connexion réussie!')
    } catch (error: any) {
      console.error('Authentication error:', error)
      
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid_credentials')) {
        toast.error('Email ou mot de passe incorrect. Vérifiez vos identifiants.')
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Veuillez confirmer votre email avant de vous connecter.')
      } else {
        toast.error(error.message || 'Une erreur est survenue lors de la connexion')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)

    try {
      // Ici vous pouvez implémenter la logique de réinitialisation
      // Pour l'instant, on simule l'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Un email de réinitialisation a été envoyé à votre adresse.')
      setShowForgotPassword(false)
      setResetEmail('')
    } catch (error: any) {
      toast.error('Erreur lors de l\'envoi de l\'email de réinitialisation')
    } finally {
      setResetLoading(false)
    }
  }

  // Charger l'email sauvegardé au montage du composant
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('creditpro_remember_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <img 
                src="/CreditPro.svg" 
                alt="CreditPro Logo" 
                className="w-20 h-20 object-contain mx-auto"
              />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">
              <span className="text-gray-900 dark:text-white">Credit</span>
              <span className="text-red-500">Pro</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Plateforme de Transfert de Crédit Avancée
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {!showForgotPassword ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Se souvenir de moi
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    loading={isLoading}
                    size="lg"
                  >
                    Se connecter
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="forgot-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleForgotPassword}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Réinitialiser le mot de passe
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Entrez votre adresse email pour recevoir un lien de réinitialisation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setResetEmail('')
                      }}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      loading={resetLoading}
                      className="flex-1"
                    >
                      Envoyer
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Help Text */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>
                Besoin d'aide ? Contactez l'administrateur système
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <img src="/CreditPro.svg" alt="CreditPro" className="w-4 h-4" />
              </div>
              Transferts Sécurisés
            </div>
            <div>
              <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <img src="/CreditPro.svg" alt="CreditPro" className="w-4 h-4" />
                </motion.div>
              </div>
              Analytics Temps Réel
            </div>
            <div>
              <div className="w-8 h-8 bg-accent-100 dark:bg-accent-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <img src="/CreditPro.svg" alt="CreditPro" className="w-4 h-4" />
              </div>
              Multi-Opérateurs
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}