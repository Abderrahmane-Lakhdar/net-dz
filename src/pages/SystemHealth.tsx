import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  RefreshCw,
  Settings,
  Bell,
  TrendingUp,
  TrendingDown,
  Target,
  Gauge,
  Ban,
  Unlock
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/PageLoader'
import { usePageLoader } from '../hooks/usePageLoader'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'

// Monitoring Interfaces
interface SystemMetrics {
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_in: number
  network_out: number
  active_connections: number
  response_time: number
  uptime: number
}

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  response_time: number
  last_check: string
  uptime: number
  error_rate: number
}

interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  timestamp: string
  service: string
  resolved: boolean
}

// Performance Interfaces
interface PerformanceMetrics {
  overall_score: number
  response_time: {
    avg: number
    p95: number
    p99: number
  }
  throughput: {
    requests_per_second: number
    transactions_per_second: number
  }
  resource_usage: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  availability: {
    uptime: number
    downtime_minutes: number
    incidents: number
  }
}

interface PerformanceTrends {
  response_times: Array<{ time: string; avg: number; p95: number; p99: number }>
  throughput_data: Array<{ time: string; rps: number; tps: number }>
  resource_trends: Array<{ time: string; cpu: number; memory: number; disk: number; network: number }>
}

interface OptimizationRecommendations {
  category: 'database' | 'api' | 'frontend' | 'infrastructure'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: number
  effort: 'low' | 'medium' | 'high'
  estimated_improvement: string
}

interface LoadTestResults {
  test_name: string
  duration: number
  concurrent_users: number
  total_requests: number
  success_rate: number
  avg_response_time: number
  errors: number
  status: 'passed' | 'failed' | 'warning'
}

// Combined Interface
interface SystemHealthData {
  monitoring: {
    metrics: SystemMetrics
    services: ServiceStatus[]
    alerts: Alert[]
    performanceData: Array<{
      time: string
      cpu: number
      memory: number
      response_time: number
      transactions: number
    }>
  }
  performance: {
    metrics: PerformanceMetrics
    trends: PerformanceTrends
    recommendations: OptimizationRecommendations[]
    loadTests: LoadTestResults[]
  }
}

const loadSystemHealthData = async (): Promise<SystemHealthData> => {
  // Mock Monitoring Data
  const mockMonitoringMetrics: SystemMetrics = {
    cpu_usage: Math.random() * 100,
    memory_usage: 65 + Math.random() * 20,
    disk_usage: 45 + Math.random() * 10,
    network_in: Math.random() * 1000,
    network_out: Math.random() * 800,
    active_connections: Math.floor(Math.random() * 500) + 100,
    response_time: 50 + Math.random() * 100,
    uptime: 99.8 + Math.random() * 0.2
  }

  const mockServices: ServiceStatus[] = [
    {
      name: 'API Gateway',
      status: 'healthy',
      response_time: 45 + Math.random() * 20,
      last_check: new Date().toISOString(),
      uptime: 99.9,
      error_rate: Math.random() * 0.5
    },
    {
      name: 'Database',
      status: 'healthy',
      response_time: 12 + Math.random() * 8,
      last_check: new Date().toISOString(),
      uptime: 99.95,
      error_rate: Math.random() * 0.2
    },
    {
      name: 'USSD Service',
      status: Math.random() > 0.8 ? 'warning' : 'healthy',
      response_time: 200 + Math.random() * 100,
      last_check: new Date().toISOString(),
      uptime: 98.5 + Math.random() * 1,
      error_rate: Math.random() * 2
    },
    {
      name: 'SMS Gateway',
      status: 'healthy',
      response_time: 80 + Math.random() * 40,
      last_check: new Date().toISOString(),
      uptime: 99.2,
      error_rate: Math.random() * 1
    },
    {
      name: 'Analytics Engine',
      status: 'healthy',
      response_time: 150 + Math.random() * 50,
      last_check: new Date().toISOString(),
      uptime: 99.7,
      error_rate: Math.random() * 0.8
    }
  ]

  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      message: 'Utilisation CPU élevée détectée (>80%)',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      service: 'System',
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      message: 'Nouvelle version disponible pour le service USSD',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      service: 'USSD Service',
      resolved: false
    },
    {
      id: '3',
      type: 'error',
      message: 'Échec de connexion au modem COM5',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      service: 'USSD Service',
      resolved: true
    }
  ]

  const now = new Date()
  const monitoringPerformanceData = Array.from({ length: 24 }, (_, i) => ({
    time: new Date(now.getTime() - (23 - i) * 3600000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    cpu: 20 + Math.random() * 60,
    memory: 40 + Math.random() * 40,
    response_time: 50 + Math.random() * 100,
    transactions: Math.floor(Math.random() * 100)
  }))

  // Mock Performance Data
  const mockPerformanceMetrics: PerformanceMetrics = {
    overall_score: 87 + Math.random() * 10,
    response_time: {
      avg: 45 + Math.random() * 20,
      p95: 120 + Math.random() * 30,
      p99: 250 + Math.random() * 50
    },
    throughput: {
      requests_per_second: 450 + Math.random() * 100,
      transactions_per_second: 85 + Math.random() * 20
    },
    resource_usage: {
      cpu: 35 + Math.random() * 30,
      memory: 60 + Math.random() * 20,
      disk: 45 + Math.random() * 15,
      network: 25 + Math.random() * 25
    },
    availability: {
      uptime: 99.95 + Math.random() * 0.04,
      downtime_minutes: Math.floor(Math.random() * 5),
      incidents: Math.floor(Math.random() * 3)
    }
  }

  const mockPerformanceTrends: PerformanceTrends = {
    response_times: Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      avg: 40 + Math.random() * 30,
      p95: 100 + Math.random() * 50,
      p99: 200 + Math.random() * 100
    })),
    throughput_data: Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      rps: 400 + Math.random() * 200,
      tps: 80 + Math.random() * 40
    })),
    resource_trends: Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      cpu: 30 + Math.random() * 40,
      memory: 50 + Math.random() * 30,
      disk: 40 + Math.random() * 20,
      network: 20 + Math.random() * 30
    }))
  }

  const mockRecommendations: OptimizationRecommendations[] = [
    {
      category: 'database',
      priority: 'high',
      title: 'Optimiser les requêtes lentes',
      description: 'Ajouter des index sur les colonnes fréquemment utilisées dans les WHERE clauses',
      impact: 35,
      effort: 'medium',
      estimated_improvement: 'Réduction de 30% du temps de réponse DB'
    },
    {
      category: 'api',
      priority: 'medium',
      title: 'Implémenter le cache Redis',
      description: 'Mettre en cache les réponses API fréquemment demandées',
      impact: 25,
      effort: 'high',
      estimated_improvement: 'Amélioration de 40% du débit API'
    },
    {
      category: 'infrastructure',
      priority: 'critical',
      title: 'Mise à l\'échelle automatique',
      description: 'Configurer l\'auto-scaling basé sur les métriques de charge',
      impact: 50,
      effort: 'high',
      estimated_improvement: 'Amélioration de 60% de la disponibilité'
    }
  ]

  const mockLoadTests: LoadTestResults[] = [
    {
      test_name: 'Test de charge API',
      duration: 300,
      concurrent_users: 100,
      total_requests: 15000,
      success_rate: 99.2,
      avg_response_time: 85,
      errors: 120,
      status: 'passed'
    },
    {
      test_name: 'Test de stress USSD',
      duration: 600,
      concurrent_users: 50,
      total_requests: 8500,
      success_rate: 96.8,
      avg_response_time: 1200,
      errors: 272,
      status: 'warning'
    },
    {
      test_name: 'Test d\'endurance',
      duration: 3600,
      concurrent_users: 25,
      total_requests: 45000,
      success_rate: 99.8,
      avg_response_time: 65,
      errors: 90,
      status: 'passed'
    }
  ]

  return {
    monitoring: {
      metrics: mockMonitoringMetrics,
      services: mockServices,
      alerts: mockAlerts,
      performanceData: monitoringPerformanceData
    },
    performance: {
      metrics: mockPerformanceMetrics,
      trends: mockPerformanceTrends,
      recommendations: mockRecommendations,
      loadTests: mockLoadTests
    }
  }
}

export function SystemHealth() {
  const { loading, data, error, isStructureLoading, isDataLoading, reload } = usePageLoader(
    loadSystemHealthData,
    {
      cacheKey: 'system-health',
      structureDelay: 0,
      dataDelay: 0
    }
  )

  const [autoRefresh, setAutoRefresh] = useState(true)
  const [runningOptimization, setRunningOptimization] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        reload()
      }, 10000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, reload])

  const runOptimization = async () => {
    setRunningOptimization(true)
    try {
      toast.loading('Optimisation automatique en cours...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      toast.dismiss()
      toast.success('Optimisation terminée avec succès')
      reload()
    } catch (error) {
      toast.dismiss()
      toast.error('Erreur lors de l\'optimisation')
    } finally {
      setRunningOptimization(false)
    }
  }

  const runLoadTest = async () => {
    try {
      toast.loading('Démarrage du test de charge...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast.dismiss()
      toast.success('Test de charge terminé')
    } catch (error) {
      toast.dismiss()
      toast.error('Erreur lors du test de charge')
    }
  }

  const resolveAlert = (alertId: string) => {
    toast.success('Alerte marquée comme résolue')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'low':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database':
        return <Server className="w-4 h-4" />
      case 'api':
        return <Network className="w-4 h-4" />
      case 'frontend':
        return <Activity className="w-4 h-4" />
      case 'infrastructure':
        return <Cpu className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <PageLoader
      isStructureLoading={isStructureLoading}
      isDataLoading={isDataLoading}
      error={error}
      title="Chargement de la santé du système"
      onRetry={reload}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Santé du Système
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitoring temps réel, performance et optimisation automatique
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className="w-4 h-4 mr-2" />
              {autoRefresh ? 'Pause' : 'Resume'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={runLoadTest}>
              <Target className="w-4 h-4 mr-2" />
              Test Charge
            </Button>
            
            <Button 
              onClick={runOptimization} 
              size="sm"
              loading={runningOptimization}
            >
              <Zap className="w-4 h-4 mr-2" />
              Optimiser
            </Button>
          </div>
        </div>

        {/* System Overview */}
        {data?.monitoring.metrics && data?.performance.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Score Global
                    </p>
                    <p className={`text-2xl font-bold ${getScoreColor(data.performance.metrics.overall_score)}`}>
                      {data.performance.metrics.overall_score.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      /100
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <Gauge className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      CPU Usage
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.monitoring.metrics.cpu_usage.toFixed(1)}%
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          data.monitoring.metrics.cpu_usage > 80 ? 'bg-red-500' :
                          data.monitoring.metrics.cpu_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${data.monitoring.metrics.cpu_usage}%` }}
                      />
                    </div>
                  </div>
                  <Cpu className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Temps Réponse
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.performance.metrics.response_time.avg.toFixed(0)}ms
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      P95: {data.performance.metrics.response_time.p95.toFixed(0)}ms
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Disponibilité
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.performance.metrics.availability.uptime.toFixed(2)}%
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      {data.performance.metrics.availability.incidents} incident(s)
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Charts */}
        {data?.performance.trends && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Temps de Réponse
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Évolution des temps de réponse (24h)
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.performance.trends.response_times}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" className="text-xs" />
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
                      dataKey="avg" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Moyenne"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="p95" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="P95"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="p99" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="P99"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Débit Système
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Requêtes et transactions par seconde
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.performance.trends.throughput_data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rps" 
                      stackId="1"
                      stroke="#22c55e" 
                      fill="#22c55e"
                      fillOpacity={0.6}
                      name="Req/sec"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tps" 
                      stackId="2"
                      stroke="#f59e0b" 
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="Trans/sec"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Services Status */}
        {data?.monitoring.services && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Statut des Services
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Surveillance des services critiques
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.monitoring.services.map((service) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                        <span className="font-medium">{service.response_time.toFixed(0)}ms</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                        <span className="font-medium text-green-600">{service.uptime.toFixed(2)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Error Rate:</span>
                        <span className={`font-medium ${
                          service.error_rate < 1 ? 'text-green-600' :
                          service.error_rate < 5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {service.error_rate.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Load Test Results */}
        {data?.performance.loadTests && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Résultats des Tests de Charge
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Historique des tests de performance
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Test
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Durée
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Utilisateurs
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Taux Succès
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Temps Réponse
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.performance.loadTests.map((test, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-100 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium">{test.test_name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span>{Math.floor(test.duration / 60)}m {test.duration % 60}s</span>
                        </td>
                        <td className="py-3 px-4">
                          <span>{test.concurrent_users}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            test.success_rate > 99 ? 'text-green-600' :
                            test.success_rate > 95 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {test.success_rate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">
                            {test.avg_response_time.toFixed(0)}ms
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getTestStatusIcon(test.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              test.status === 'passed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                              test.status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {test.status}
                            </span>
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

        {/* Optimization Recommendations */}
        {data?.performance.recommendations && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recommandations d'Optimisation
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Suggestions automatiques pour améliorer les performances
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.performance.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        {getCategoryIcon(rec.category)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {rec.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            +{rec.impact}% impact
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {rec.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Effort: {rec.effort}</span>
                          <span>Catégorie: {rec.category}</span>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {rec.estimated_improvement}
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Appliquer
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {data?.monitoring.alerts && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Alertes Système
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {data.monitoring.alerts.filter(a => !a.resolved).length} alerte(s) active(s)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.monitoring.alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start space-x-3 p-4 rounded-lg border ${
                      alert.resolved 
                        ? 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 opacity-60'
                        : alert.type === 'error' 
                          ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
                          : alert.type === 'warning'
                            ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700'
                            : 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          alert.resolved ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {alert.message}
                        </p>
                        {!alert.resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Résoudre
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.service}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(alert.timestamp).toLocaleString('fr-FR')}
                        </span>
                        {alert.resolved && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Résolu
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {data.monitoring.alerts.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Aucune alerte système
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLoader>
  )
}