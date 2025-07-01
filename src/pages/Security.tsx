import React, { useState } from 'react'
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Key,
  UserCheck,
  Activity,
  Clock,
  Settings,
  RefreshCw,
  Download,
  Search,
  Filter,
  Ban,
  Unlock
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/PageLoader'
import { usePageLoader } from '../hooks/usePageLoader'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

interface SecurityMetrics {
  threat_level: 'low' | 'medium' | 'high' | 'critical'
  active_sessions: number
  failed_logins: number
  blocked_ips: number
  security_score: number
  last_scan: string
}

interface SecurityEvent {
  id: string
  type: 'login_attempt' | 'suspicious_activity' | 'data_access' | 'system_change' | 'threat_detected'
  severity: 'low' | 'medium' | 'high' | 'critical'
  user: string
  ip_address: string
  description: string
  timestamp: string
  status: 'active' | 'resolved' | 'investigating'
}

interface AccessControl {
  user_id: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
  last_login: string
  login_count: number
  permissions: string[]
  status: 'active' | 'suspended' | 'locked'
  mfa_enabled: boolean
}

interface ThreatAnalysis {
  attack_vectors: Array<{ type: string; count: number; severity: string }>
  geographic_threats: Array<{ country: string; threats: number; blocked: number }>
  time_patterns: Array<{ hour: number; incidents: number }>
}

const loadSecurityData = async () => {
  const mockMetrics: SecurityMetrics = {
    threat_level: 'low',
    active_sessions: 12,
    failed_logins: 3,
    blocked_ips: 45,
    security_score: 94,
    last_scan: new Date(Date.now() - 1800000).toISOString()
  }

  const mockEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'login_attempt',
      severity: 'medium',
      user: 'admin@creditpro.dz',
      ip_address: '192.168.1.100',
      description: 'Tentative de connexion avec mot de passe incorrect',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'resolved'
    },
    {
      id: '2',
      type: 'suspicious_activity',
      severity: 'high',
      user: 'unknown',
      ip_address: '45.123.45.67',
      description: 'Tentatives multiples d\'accès à l\'API depuis IP suspecte',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: 'investigating'
    },
    {
      id: '3',
      type: 'data_access',
      severity: 'low',
      user: 'operator@creditpro.dz',
      ip_address: '192.168.1.105',
      description: 'Accès aux données clients en dehors des heures normales',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: 'active'
    },
    {
      id: '4',
      type: 'threat_detected',
      severity: 'critical',
      user: 'system',
      ip_address: '89.234.156.78',
      description: 'Tentative d\'injection SQL détectée',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      status: 'resolved'
    },
    {
      id: '5',
      type: 'system_change',
      severity: 'medium',
      user: 'admin@creditpro.dz',
      ip_address: '192.168.1.100',
      description: 'Modification des règles de pricing',
      timestamp: new Date(Date.now() - 1500000).toISOString(),
      status: 'resolved'
    }
  ]

  const mockAccessControl: AccessControl[] = [
    {
      user_id: '1',
      email: 'admin@creditpro.dz',
      role: 'admin',
      last_login: new Date(Date.now() - 300000).toISOString(),
      login_count: 156,
      permissions: ['read', 'write', 'delete', 'admin'],
      status: 'active',
      mfa_enabled: true
    },
    {
      user_id: '2',
      email: 'operator@creditpro.dz',
      role: 'operator',
      last_login: new Date(Date.now() - 3600000).toISOString(),
      login_count: 89,
      permissions: ['read', 'write'],
      status: 'active',
      mfa_enabled: false
    },
    {
      user_id: '3',
      email: 'viewer@creditpro.dz',
      role: 'viewer',
      last_login: new Date(Date.now() - 86400000).toISOString(),
      login_count: 23,
      permissions: ['read'],
      status: 'suspended',
      mfa_enabled: false
    }
  ]

  const mockThreatAnalysis: ThreatAnalysis = {
    attack_vectors: [
      { type: 'Brute Force', count: 45, severity: 'medium' },
      { type: 'SQL Injection', count: 12, severity: 'high' },
      { type: 'XSS', count: 8, severity: 'medium' },
      { type: 'CSRF', count: 3, severity: 'low' },
      { type: 'DDoS', count: 2, severity: 'critical' }
    ],
    geographic_threats: [
      { country: 'Russie', threats: 23, blocked: 21 },
      { country: 'Chine', threats: 18, blocked: 16 },
      { country: 'Brésil', threats: 12, blocked: 10 },
      { country: 'Inde', threats: 8, blocked: 7 },
      { country: 'Autres', threats: 15, blocked: 13 }
    ],
    time_patterns: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      incidents: Math.floor(Math.random() * 10) + (i >= 9 && i <= 17 ? 5 : 0)
    }))
  }

  return {
    metrics: mockMetrics,
    events: mockEvents,
    accessControl: mockAccessControl,
    threatAnalysis: mockThreatAnalysis
  }
}

export function Security() {
  const { loading, data, error, isStructureLoading, isDataLoading, reload } = usePageLoader(
    loadSecurityData,
    {
      cacheKey: 'security',
      structureDelay: 0,
      dataDelay: 0
    }
  )

  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const runSecurityScan = async () => {
    try {
      toast.loading('Scan de sécurité en cours...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast.dismiss()
      toast.success('Scan de sécurité terminé')
      reload()
    } catch (error) {
      toast.dismiss()
      toast.error('Erreur lors du scan de sécurité')
    }
  }

  const blockUser = async (userId: string) => {
    try {
      toast.success('Statut utilisateur modifié')
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const resolveEvent = async (eventId: string) => {
    try {
      toast.success('Événement marqué comme résolu')
    } catch (error) {
      toast.error('Erreur lors de la résolution')
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900'
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'login_attempt':
        return <Key className="w-4 h-4" />
      case 'suspicious_activity':
        return <Eye className="w-4 h-4" />
      case 'data_access':
        return <Lock className="w-4 h-4" />
      case 'system_change':
        return <Settings className="w-4 h-4" />
      case 'threat_detected':
        return <Shield className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      case 'operator':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
      case 'viewer':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  const filteredEvents = (data?.events || []).filter(event => {
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.ip_address.includes(searchTerm)
    return matchesSeverity && matchesSearch
  })

  return (
    <PageLoader
      isStructureLoading={isStructureLoading}
      isDataLoading={isDataLoading}
      error={error}
      title="Chargement du système de sécurité"
      onRetry={reload}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sécurité & Audit
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Surveillance, contrôles d'accès et détection d'anomalies
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Rapport
            </Button>
            
            <Button onClick={runSecurityScan} size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Scan Sécurité
            </Button>
          </div>
        </div>

        {/* Security Overview */}
        {data?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Niveau de Menace
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getThreatLevelColor(data.metrics.threat_level)}`}>
                        {data.metrics.threat_level.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Score: {data.metrics.security_score}/100
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Sessions Actives
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.metrics.active_sessions}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Utilisateurs connectés
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tentatives Échouées
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.metrics.failed_logins}
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Dernières 24h
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      IPs Bloquées
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.metrics.blocked_ips}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Protection active
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <Ban className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Threat Analysis Charts */}
        {data?.threatAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Vecteurs d'Attaque
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Types de menaces détectées
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.threatAnalysis.attack_vectors}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="type" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Patterns Temporels
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Incidents de sécurité par heure
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.threatAnalysis.time_patterns}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="incidents" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Access Control */}
        {data?.accessControl && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contrôle d'Accès
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestion des utilisateurs et permissions
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Utilisateur
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Rôle
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Dernière Connexion
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        MFA
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Statut
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.accessControl.map((user) => (
                      <motion.tr
                        key={user.user_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-gray-100 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.email}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.login_count} connexions
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p>{new Date(user.last_login).toLocaleDateString('fr-FR')}</p>
                            <p className="text-gray-500">
                              {new Date(user.last_login).toLocaleTimeString('fr-FR')}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {user.mfa_enabled ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm ${user.mfa_enabled ? 'text-green-600' : 'text-red-600'}`}>
                              {user.mfa_enabled ? 'Activé' : 'Désactivé'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            user.status === 'suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => blockUser(user.user_id)}
                            >
                              {user.status === 'active' ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </Button>
                            
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Événements de Sécurité
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredEvents.length} événement(s) trouvé(s)
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">Toutes les sévérités</option>
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="critical">Critique</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      event.status === 'resolved' 
                        ? 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 opacity-75'
                        : event.severity === 'critical'
                          ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
                          : event.severity === 'high'
                            ? 'bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-700'
                            : event.severity === 'medium'
                              ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700'
                              : 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(event.type)}
                          {getSeverityIcon(event.severity)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {event.description}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            event.status === 'investigating' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>Utilisateur: {event.user}</span>
                          <span>IP: {event.ip_address}</span>
                          <span>{new Date(event.timestamp).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                      
                      {event.status !== 'resolved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            resolveEvent(event.id)
                          }}
                        >
                          Résoudre
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun événement de sécurité trouvé
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLoader>
  )
}