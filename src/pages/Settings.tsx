import React, { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Key,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/PageLoader'
import { usePageLoader } from '../hooks/usePageLoader'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface SystemSettings {
  general: {
    app_name: string
    app_version: string
    timezone: string
    language: string
    currency: string
    date_format: string
  }
  notifications: {
    email_enabled: boolean
    sms_enabled: boolean
    push_enabled: boolean
    alert_threshold: number
    daily_reports: boolean
    weekly_reports: boolean
  }
  security: {
    session_timeout: number
    max_login_attempts: number
    password_policy: {
      min_length: number
      require_uppercase: boolean
      require_lowercase: boolean
      require_numbers: boolean
      require_symbols: boolean
    }
    two_factor_required: boolean
    ip_whitelist: string[]
  }
  api: {
    rate_limit: number
    timeout: number
    retry_attempts: number
    cache_duration: number
  }
  database: {
    backup_frequency: string
    retention_days: number
    auto_optimize: boolean
    connection_pool_size: number
  }
}

interface UserProfile {
  name: string
  email: string
  role: string
  avatar: string | null
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    notifications: boolean
    dashboard_layout: string
  }
}

const loadSettingsData = async () => {
  const mockSettings: SystemSettings = {
    general: {
      app_name: 'CreditPro',
      app_version: '1.0.0',
      timezone: 'Africa/Algiers',
      language: 'fr-FR',
      currency: 'DZD',
      date_format: 'DD/MM/YYYY'
    },
    notifications: {
      email_enabled: true,
      sms_enabled: false,
      push_enabled: true,
      alert_threshold: 80,
      daily_reports: true,
      weekly_reports: true
    },
    security: {
      session_timeout: 30,
      max_login_attempts: 5,
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: false
      },
      two_factor_required: false,
      ip_whitelist: ['192.168.1.0/24', '10.0.0.0/8']
    },
    api: {
      rate_limit: 1000,
      timeout: 30,
      retry_attempts: 3,
      cache_duration: 300
    },
    database: {
      backup_frequency: 'daily',
      retention_days: 30,
      auto_optimize: true,
      connection_pool_size: 20
    }
  }

  const mockUserProfile: UserProfile = {
    name: 'Administrateur',
    email: 'admin@creditpro.dz',
    role: 'Administrateur Système',
    avatar: null,
    preferences: {
      theme: 'dark',
      language: 'fr-FR',
      notifications: true,
      dashboard_layout: 'default'
    }
  }

  return {
    settings: mockSettings,
    userProfile: mockUserProfile
  }
}

export function Settings() {
  const { loading, data, error, isStructureLoading, isDataLoading, reload } = usePageLoader(
    loadSettingsData,
    {
      cacheKey: 'settings',
      structureDelay: 0,
      dataDelay: 0
    }
  )

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newIpAddress, setNewIpAddress] = useState('')
  
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  const saveSettings = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Paramètres sauvegardés avec succès')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addIpToWhitelist = () => {
    if (!newIpAddress) return
    
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
    if (!ipRegex.test(newIpAddress)) {
      toast.error('Format d\'adresse IP invalide')
      return
    }

    setNewIpAddress('')
    toast.success('Adresse IP ajoutée à la liste blanche')
  }

  const removeIpFromWhitelist = (ip: string) => {
    toast.success('Adresse IP supprimée de la liste blanche')
  }

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Mot de passe modifié avec succès')
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe')
    }
  }

  const tabs = [
    { id: 'general', name: 'Général', icon: SettingsIcon },
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'api', name: 'API', icon: Globe },
    { id: 'database', name: 'Base de Données', icon: Database },
    { id: 'appearance', name: 'Apparence', icon: Palette }
  ]

  return (
    <PageLoader
      isStructureLoading={isStructureLoading}
      isDataLoading={isDataLoading}
      error={error}
      title="Chargement des paramètres"
      onRetry={reload}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Paramètres Système
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configuration système, préférences et gestion des utilisateurs
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={reload}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            
            <Button onClick={saveSettings} loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* General Settings */}
                {activeTab === 'general' && data?.settings && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Paramètres Généraux
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configuration de base de l'application
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom de l'application
                          </label>
                          <input
                            type="text"
                            value={data.settings.general.app_name}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Version
                          </label>
                          <input
                            type="text"
                            value={data.settings.general.app_version}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fuseau horaire
                          </label>
                          <select
                            value={data.settings.general.timezone}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                          >
                            <option value="Africa/Algiers">Algérie (UTC+1)</option>
                            <option value="Europe/Paris">Paris (UTC+1)</option>
                            <option value="UTC">UTC</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Langue
                          </label>
                          <select
                            value={data.settings.general.language}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                          >
                            <option value="fr-FR">Français</option>
                            <option value="ar-DZ">العربية</option>
                            <option value="en-US">English</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Devise
                          </label>
                          <select
                            value={data.settings.general.currency}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                          >
                            <option value="DZD">Dinar Algérien (DZD)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="USD">Dollar US (USD)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Format de date
                          </label>
                          <select
                            value={data.settings.general.date_format}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* User Profile */}
                {activeTab === 'profile' && data?.userProfile && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Profil Utilisateur
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Informations personnelles et préférences
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {data.userProfile.name}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">{data.userProfile.role}</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Changer l'avatar
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom complet
                          </label>
                          <input
                            type="text"
                            value={data.userProfile.name}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={data.userProfile.email}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                          Changer le mot de passe
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Nouveau mot de passe
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                                placeholder="Nouveau mot de passe"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Confirmer le mot de passe
                            </label>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                              placeholder="Confirmer le mot de passe"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={changePassword} 
                          className="mt-4"
                          disabled={!newPassword || !confirmPassword}
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Changer le mot de passe
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && data?.settings && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Paramètres de Sécurité
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configuration de la sécurité et des accès
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Timeout de session (minutes)
                          </label>
                          <input
                            type="number"
                            value={data.settings.security.session_timeout}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tentatives de connexion max
                          </label>
                          <input
                            type="number"
                            value={data.settings.security.max_login_attempts}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                          Politique de mot de passe
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Longueur minimale
                            </label>
                            <input
                              type="number"
                              value={data.settings.security.password_policy.min_length}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={data.settings.security.password_policy.require_uppercase}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Majuscules requises</span>
                            </label>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={data.settings.security.password_policy.require_numbers}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Chiffres requis</span>
                            </label>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={data.settings.security.password_policy.require_symbols}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Symboles requis</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                          Liste blanche IP
                        </h4>
                        <div className="space-y-3">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newIpAddress}
                              onChange={(e) => setNewIpAddress(e.target.value)}
                              placeholder="192.168.1.0/24"
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                            />
                            <Button onClick={addIpToWhitelist}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {data.settings.security.ip_whitelist.map((ip, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-700 rounded">
                                <span className="font-mono text-sm">{ip}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeIpFromWhitelist(ip)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Apparence
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Personnalisation de l'interface utilisateur
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                          Thème
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            theme === 'light' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 dark:border-dark-600'
                          }`}>
                            <div className="w-full h-20 bg-white border rounded mb-2"></div>
                            <p className="text-sm font-medium text-center">Clair</p>
                          </div>
                          
                          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-200 dark:border-dark-600'
                          }`}>
                            <div className="w-full h-20 bg-gray-800 border rounded mb-2"></div>
                            <p className="text-sm font-medium text-center">Sombre</p>
                          </div>
                          
                          <div className="p-4 border-2 border-gray-200 dark:border-dark-600 rounded-lg cursor-pointer">
                            <div className="w-full h-20 bg-gradient-to-r from-white to-gray-800 border rounded mb-2"></div>
                            <p className="text-sm font-medium text-center">Auto</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Mode sombre</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Basculer entre les thèmes clair et sombre
                          </p>
                        </div>
                        <Button onClick={toggleTheme} variant="outline">
                          {theme === 'dark' ? 'Passer au clair' : 'Passer au sombre'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageLoader>
  )
}