import React, { useState, useEffect } from 'react'
import { 
  Database as DatabaseIcon, 
  Server, 
  HardDrive, 
  Activity,
  BarChart3,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Archive,
  Shield,
  Cpu,
  MemoryStick
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/PageLoader'
import { usePageLoader } from '../hooks/usePageLoader'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'

interface DatabaseMetrics {
  connections: {
    active: number
    idle: number
    max: number
  }
  performance: {
    queries_per_second: number
    avg_query_time: number
    cache_hit_ratio: number
    index_usage: number
  }
  storage: {
    total_size: number
    used_size: number
    table_sizes: Array<{ table: string; size: number; rows: number }>
  }
  health: {
    status: 'healthy' | 'warning' | 'critical'
    uptime: number
    last_backup: string
    replication_lag: number
  }
}

interface QueryAnalytics {
  slow_queries: Array<{
    query: string
    duration: number
    frequency: number
    table: string
  }>
  performance_trends: Array<{
    time: string
    queries_per_sec: number
    avg_response_time: number
    connections: number
  }>
  index_recommendations: Array<{
    table: string
    column: string
    impact: number
    query_count: number
  }>
}

interface BackupStatus {
  last_backup: string
  backup_size: number
  status: 'success' | 'running' | 'failed'
  retention_days: number
  auto_backup: boolean
}

const loadDatabaseData = async () => {
  const mockMetrics: DatabaseMetrics = {
    connections: {
      active: Math.floor(Math.random() * 50) + 10,
      idle: Math.floor(Math.random() * 20) + 5,
      max: 100
    },
    performance: {
      queries_per_second: Math.floor(Math.random() * 500) + 200,
      avg_query_time: Math.random() * 50 + 10,
      cache_hit_ratio: 95 + Math.random() * 4,
      index_usage: 85 + Math.random() * 10
    },
    storage: {
      total_size: 50 * 1024 * 1024 * 1024,
      used_size: 32 * 1024 * 1024 * 1024,
      table_sizes: [
        { table: 'transactions', size: 15 * 1024 * 1024 * 1024, rows: 1250000 },
        { table: 'clients', size: 8 * 1024 * 1024 * 1024, rows: 350000 },
        { table: 'client_analytics', size: 5 * 1024 * 1024 * 1024, rows: 2800000 },
        { table: 'sims', size: 2 * 1024 * 1024 * 1024, rows: 150 },
        { table: 'operators', size: 1 * 1024 * 1024 * 1024, rows: 3 },
        { table: 'pricing_rules', size: 1 * 1024 * 1024 * 1024, rows: 45 }
      ]
    },
    health: {
      status: 'healthy',
      uptime: 99.97,
      last_backup: new Date(Date.now() - 3600000).toISOString(),
      replication_lag: Math.random() * 100
    }
  }

  const mockAnalytics: QueryAnalytics = {
    slow_queries: [
      {
        query: 'SELECT * FROM transactions WHERE created_at > ?',
        duration: 2.5,
        frequency: 45,
        table: 'transactions'
      },
      {
        query: 'SELECT COUNT(*) FROM clients GROUP BY segment',
        duration: 1.8,
        frequency: 23,
        table: 'clients'
      },
      {
        query: 'UPDATE client_analytics SET total_amount = ?',
        duration: 1.2,
        frequency: 67,
        table: 'client_analytics'
      }
    ],
    performance_trends: Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      queries_per_sec: 200 + Math.random() * 300,
      avg_response_time: 10 + Math.random() * 40,
      connections: 10 + Math.random() * 40
    })),
    index_recommendations: [
      {
        table: 'transactions',
        column: 'recipient_phone',
        impact: 85,
        query_count: 1250
      },
      {
        table: 'clients',
        column: 'last_activity',
        impact: 72,
        query_count: 890
      },
      {
        table: 'client_analytics',
        column: 'date, client_id',
        impact: 68,
        query_count: 2340
      }
    ]
  }

  const mockBackupStatus: BackupStatus = {
    last_backup: new Date(Date.now() - 3600000).toISOString(),
    backup_size: 8.5 * 1024 * 1024 * 1024,
    status: 'success',
    retention_days: 30,
    auto_backup: true
  }

  return {
    metrics: mockMetrics,
    analytics: mockAnalytics,
    backupStatus: mockBackupStatus
  }
}

export function Database() {
  const { loading, data, error, isStructureLoading, isDataLoading, reload } = usePageLoader(
    loadDatabaseData,
    {
      cacheKey: 'database',
      structureDelay: 0,
      dataDelay: 0
    }
  )

  const [autoRefresh, setAutoRefresh] = useState(true)

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

  const runBackup = async () => {
    try {
      toast.loading('Démarrage de la sauvegarde...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast.dismiss()
      toast.success('Sauvegarde terminée avec succès')
    } catch (error) {
      toast.dismiss()
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const optimizeDatabase = async () => {
    try {
      toast.loading('Optimisation en cours...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.dismiss()
      toast.success('Base de données optimisée')
      reload()
    } catch (error) {
      toast.dismiss()
      toast.error('Erreur lors de l\'optimisation')
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getHealthIcon = (status: string) => {
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

  const getBackupStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500 animate-spin" />
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
      title="Chargement des métriques de base de données"
      onRetry={reload}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Base de Données
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitoring, optimisation et maintenance automatisée
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
            
            <Button variant="outline" size="sm" onClick={optimizeDatabase}>
              <Zap className="w-4 h-4 mr-2" />
              Optimiser
            </Button>
            
            <Button onClick={reload} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Database Health Overview */}
        {data?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Statut DB
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getHealthIcon(data.metrics.health.status)}
                      <span className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                        {data.metrics.health.status}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Uptime: {data.metrics.health.uptime.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <DatabaseIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Connexions
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.metrics.connections.active}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {data.metrics.connections.idle} inactives
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Server className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Performance
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.metrics.performance.queries_per_second.toFixed(0)}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      requêtes/sec
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Stockage
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {((data.metrics.storage.used_size / data.metrics.storage.total_size) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      {formatBytes(data.metrics.storage.used_size)} utilisés
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                    <HardDrive className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Charts */}
        {data?.analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance Temps Réel
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Requêtes par seconde et temps de réponse
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.analytics.performance_trends}>
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
                      dataKey="queries_per_sec" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Requêtes/sec"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avg_response_time" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Temps réponse (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Connexions Actives
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Évolution du nombre de connexions
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.analytics.performance_trends}>
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
                      dataKey="connections" 
                      stroke="#22c55e" 
                      fill="#22c55e"
                      fillOpacity={0.3}
                      name="Connexions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Table Sizes */}
        {data?.metrics && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Taille des Tables
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Utilisation de l'espace par table
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.metrics.storage.table_sizes.map((table) => (
                  <motion.div
                    key={table.table}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <DatabaseIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {table.table}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {table.rows.toLocaleString()} lignes
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatBytes(table.size)}
                      </p>
                      <div className="w-32 bg-gray-200 dark:bg-dark-600 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${(table.size / data.metrics.storage.table_sizes[0].size) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backup Status & Slow Queries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Backup Status */}
          {data?.backupStatus && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sauvegardes
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Statut et gestion des sauvegardes
                    </p>
                  </div>
                  <Button
                    onClick={runBackup}
                    size="sm"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getBackupStatusIcon(data.backupStatus.status)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Dernière sauvegarde
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(data.backupStatus.last_backup).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatBytes(data.backupStatus.backup_size)}
                      </p>
                      <p className={`text-sm ${
                        data.backupStatus.status === 'success' ? 'text-green-600' :
                        data.backupStatus.status === 'running' ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {data.backupStatus.status}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rétention</p>
                      <p className="font-semibold text-lg">{data.backupStatus.retention_days} jours</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Auto-backup</p>
                      <p className={`font-semibold text-lg ${
                        data.backupStatus.auto_backup ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.backupStatus.auto_backup ? 'Activé' : 'Désactivé'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slow Queries */}
          {data?.analytics && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Requêtes Lentes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Requêtes nécessitant une optimisation
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.analytics.slow_queries.map((query, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {query.table}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {query.frequency}x
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            query.duration > 2 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            query.duration > 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {query.duration.toFixed(1)}s
                          </span>
                        </div>
                      </div>
                      <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-600 p-2 rounded block">
                        {query.query}
                      </code>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Index Recommendations */}
        {data?.analytics && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recommandations d'Index
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Suggestions d'optimisation automatiques
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.analytics.index_recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                          Index sur {rec.table}.{rec.column}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {rec.query_count.toLocaleString()} requêtes concernées
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">
                          +{rec.impact}%
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          amélioration
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Créer Index
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLoader>
  )
}