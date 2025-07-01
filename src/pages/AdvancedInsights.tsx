import { useState } from 'react'
import { 
  Brain,
  TrendingUp, 
  RefreshCw,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Download,
  BarChart3,
  Users,
  DollarSign,
  Settings,
  Lightbulb,
  Cpu,
  Activity,
  Star,
  Percent
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/PageLoader'
import { usePageLoader } from '../hooks/usePageLoader'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import toast from 'react-hot-toast'

// Analytics Interfaces
interface AnalyticsData {
  revenue: {
    daily: Array<{ date: string; amount: number; transactions: number }>
    monthly: Array<{ month: string; amount: number; growth: number }>
  }
  clients: {
    segments: Array<{ segment: string; count: number; percentage: number }>
    acquisition: Array<{ date: string; new_clients: number; total_clients: number }>
  }
  operators: {
    performance: Array<{ name: string; transactions: number; revenue: number; success_rate: number }>
    trends: Array<{ date: string; djezzy: number; mobilis: number; ooredoo: number }>
  }
  predictions: {
    revenue_forecast: Array<{ date: string; predicted: number; confidence: number }>
    client_churn: Array<{ segment: string; risk_score: number; count: number }>
  }
}

// Intelligence Interfaces
interface MLModel {
  name: string
  type: 'classification' | 'regression' | 'clustering'
  accuracy: number
  status: 'training' | 'deployed' | 'testing'
  last_trained: string
  predictions_count: number
}

interface ClientInsight {
  client_id: string
  phone: string
  segment: string
  churn_probability: number
  lifetime_value: number
  next_transaction_prediction: {
    amount: number
    date: string
    confidence: number
  }
  behavioral_score: number
  recommendations: string[]
}

interface BusinessIntelligence {
  revenue_forecast: {
    next_7_days: number
    next_30_days: number
    confidence: number
  }
  market_trends: {
    growth_rate: number
    seasonal_patterns: any[]
    competitor_analysis: any[]
  }
  optimization_opportunities: {
    pricing: string[]
    operations: string[]
    marketing: string[]
  }
}

interface IntelligenceData {
  models: MLModel[]
  insights: ClientInsight[]
  businessIntel: BusinessIntelligence
}

// Combined Interface
interface AdvancedInsightsData {
  analytics: AnalyticsData
  intelligence: IntelligenceData
}

const loadAnalyticsData = async (): Promise<AnalyticsData> => {
  return {
    revenue: {
      daily: [
        { date: '2024-01-20', amount: 125000, transactions: 45 },
        { date: '2024-01-21', amount: 142000, transactions: 52 },
        { date: '2024-01-22', amount: 98000, transactions: 38 },
        { date: '2024-01-23', amount: 167000, transactions: 61 },
        { date: '2024-01-24', amount: 189000, transactions: 73 },
        { date: '2024-01-25', amount: 234000, transactions: 89 },
        { date: '2024-01-26', amount: 198000, transactions: 67 }
      ],
      monthly: [
        { month: 'Oct', amount: 2450000, growth: 12.5 },
        { month: 'Nov', amount: 2780000, growth: 13.5 },
        { month: 'Déc', amount: 3120000, growth: 12.2 },
        { month: 'Jan', amount: 3450000, growth: 10.6 }
      ]
    },
    clients: {
      segments: [
        { segment: 'VIP', count: 45, percentage: 15.2 },
        { segment: 'REGULAR', count: 156, percentage: 52.7 },
        { segment: 'NEW', count: 78, percentage: 26.4 },
        { segment: 'RISK', count: 17, percentage: 5.7 }
      ],
      acquisition: [
        { date: '2024-01-20', new_clients: 8, total_clients: 280 },
        { date: '2024-01-21', new_clients: 12, total_clients: 292 },
        { date: '2024-01-22', new_clients: 6, total_clients: 298 },
        { date: '2024-01-23', new_clients: 15, total_clients: 313 },
        { date: '2024-01-24', new_clients: 9, total_clients: 322 },
        { date: '2024-01-25', new_clients: 18, total_clients: 340 },
        { date: '2024-01-26', new_clients: 11, total_clients: 351 }
      ]
    },
    operators: {
      performance: [
        { name: 'Djezzy', transactions: 1245, revenue: 156000, success_rate: 94.2 },
        { name: 'Mobilis', transactions: 987, revenue: 124000, success_rate: 91.8 },
        { name: 'Ooredoo', transactions: 756, revenue: 98000, success_rate: 96.1 }
      ],
      trends: [
        { date: '20/01', djezzy: 45, mobilis: 32, ooredoo: 28 },
        { date: '21/01', djezzy: 52, mobilis: 38, ooredoo: 31 },
        { date: '22/01', djezzy: 38, mobilis: 29, ooredoo: 25 },
        { date: '23/01', djezzy: 61, mobilis: 45, ooredoo: 38 },
        { date: '24/01', djezzy: 73, mobilis: 56, ooredoo: 42 },
        { date: '25/01', djezzy: 89, mobilis: 67, ooredoo: 51 },
        { date: '26/01', djezzy: 67, mobilis: 48, ooredoo: 39 }
      ]
    },
    predictions: {
      revenue_forecast: [
        { date: '27/01', predicted: 210000, confidence: 85 },
        { date: '28/01', predicted: 225000, confidence: 82 },
        { date: '29/01', predicted: 195000, confidence: 78 },
        { date: '30/01', predicted: 240000, confidence: 75 },
        { date: '31/01', predicted: 260000, confidence: 72 }
      ],
      client_churn: [
        { segment: 'VIP', risk_score: 15, count: 3 },
        { segment: 'REGULAR', risk_score: 25, count: 12 },
        { segment: 'NEW', risk_score: 35, count: 8 },
        { segment: 'RISK', risk_score: 75, count: 15 }
      ]
    }
  }
}

const loadIntelligenceData = async (): Promise<IntelligenceData> => {
  const mockModels: MLModel[] = [
    {
      name: 'Prédiction de Churn',
      type: 'classification',
      accuracy: 94.2,
      status: 'deployed',
      last_trained: '2024-01-25T10:30:00Z',
      predictions_count: 1247
    },
    {
      name: 'Segmentation Clients',
      type: 'clustering',
      accuracy: 87.8,
      status: 'deployed',
      last_trained: '2024-01-24T15:45:00Z',
      predictions_count: 856
    },
    {
      name: 'Prédiction de Revenus',
      type: 'regression',
      accuracy: 91.5,
      status: 'training',
      last_trained: '2024-01-26T08:15:00Z',
      predictions_count: 0
    },
    {
      name: 'Détection de Fraude',
      type: 'classification',
      accuracy: 96.7,
      status: 'deployed',
      last_trained: '2024-01-23T12:20:00Z',
      predictions_count: 342
    },
    {
      name: 'Optimisation Pricing',
      type: 'regression',
      accuracy: 89.3,
      status: 'testing',
      last_trained: '2024-01-25T16:00:00Z',
      predictions_count: 156
    }
  ]

  const mockInsights: ClientInsight[] = [
    {
      client_id: '1',
      phone: '+213555123456',
      segment: 'VIP',
      churn_probability: 15.2,
      lifetime_value: 125000,
      next_transaction_prediction: {
        amount: 15000,
        date: '2024-01-28',
        confidence: 87
      },
      behavioral_score: 92,
      recommendations: [
        'Proposer une offre VIP exclusive',
        'Augmenter la limite de transfert',
        'Contact proactif pour fidélisation'
      ]
    },
    {
      client_id: '2',
      phone: '+213666789012',
      segment: 'REGULAR',
      churn_probability: 45.8,
      lifetime_value: 45000,
      next_transaction_prediction: {
        amount: 8000,
        date: '2024-01-30',
        confidence: 72
      },
      behavioral_score: 68,
      recommendations: [
        'Campagne de rétention ciblée',
        'Offre spéciale pour réactivation',
        'Améliorer l\'expérience utilisateur'
      ]
    },
    {
      client_id: '3',
      phone: '+213777345678',
      segment: 'NEW',
      churn_probability: 25.3,
      lifetime_value: 12000,
      next_transaction_prediction: {
        amount: 5000,
        date: '2024-01-29',
        confidence: 65
      },
      behavioral_score: 78,
      recommendations: [
        'Programme d\'onboarding personnalisé',
        'Bonus de bienvenue',
        'Formation sur les fonctionnalités'
      ]
    }
  ]

  const mockBusinessIntel: BusinessIntelligence = {
    revenue_forecast: {
      next_7_days: 2450000,
      next_30_days: 10800000,
      confidence: 89
    },
    market_trends: {
      growth_rate: 15.7,
      seasonal_patterns: [
        { month: 'Jan', factor: 1.2 },
        { month: 'Fév', factor: 0.9 },
        { month: 'Mar', factor: 1.1 },
        { month: 'Avr', factor: 1.0 }
      ],
      competitor_analysis: [
        { competitor: 'Concurrent A', market_share: 35, growth: 12 },
        { competitor: 'Concurrent B', market_share: 28, growth: 8 },
        { competitor: 'CreditPro', market_share: 22, growth: 18 }
      ]
    },
    optimization_opportunities: {
      pricing: [
        'Réduire les commissions VIP de 0.2% pour augmenter le volume',
        'Augmenter les tarifs RISK de 0.5% sans impact significatif',
        'Pricing dynamique basé sur la demande'
      ],
      operations: [
        'Optimiser la répartition des SIMs par opérateur',
        'Automatiser la détection des pannes modems',
        'Améliorer les temps de réponse USSD'
      ],
      marketing: [
        'Cibler les clients REGULAR avec des offres personnalisées',
        'Campagne de parrainage pour les clients VIP',
        'Programme de fidélité basé sur l\'IA'
      ]
    }
  }

  return {
    models: mockModels,
    insights: mockInsights,
    businessIntel: mockBusinessIntel
  }
}

const loadAdvancedInsightsData = async (): Promise<AdvancedInsightsData> => {
  const [analytics, intelligence] = await Promise.all([
    loadAnalyticsData(),
    loadIntelligenceData()
  ])

  return {
    analytics,
    intelligence
  }
}

export function AdvancedInsights() {
  const { data, error, isStructureLoading, isDataLoading, reload } = usePageLoader(
    loadAdvancedInsightsData,
    {
      cacheKey: 'advanced-insights',
      structureDelay: 0,
      dataDelay: 0
    }
  )

  const [dateRange, setDateRange] = useState('7d')
  const [selectedModel, setSelectedModel] = useState<string>('churn_prediction')
  const [trainingModel, setTrainingModel] = useState<string | null>(null)

  const trainModel = async (modelName: string) => {
    setTrainingModel(modelName)
    try {
      await new Promise(resolve => setTimeout(resolve, 5000))
      toast.success(`Modèle "${modelName}" entraîné avec succès`)
    } catch (error) {
      toast.error('Erreur lors de l\'entraînement du modèle')
    } finally {
      setTrainingModel(null)
    }
  }

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP': return '#fbbf24'
      case 'REGULAR': return '#3b82f6'
      case 'NEW': return '#22c55e'
      case 'RISK': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getModelStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'training':
        return <Activity className="w-4 h-4 text-blue-500 animate-spin" />
      case 'testing':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'training':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
      case 'testing':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  const getChurnRiskColor = (probability: number) => {
    if (probability < 30) return 'text-green-600'
    if (probability < 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'decrease':
        return <TrendingUp className="w-4 h-4 text-blue-500 transform rotate-180" />
      case 'dynamic':
        return <Zap className="w-4 h-4 text-purple-500" />
      default:
        return <Target className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <PageLoader
      isStructureLoading={isStructureLoading}
      isDataLoading={isDataLoading}
      error={error}
      title="Chargement des insights avancés"
      onRetry={reload}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Insights Avancés & Intelligence IA
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analytics temps réel, machine learning et prédictions intelligentes
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            
            <Button onClick={reload} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Revenus Prédits (7j)
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    1.13M DZD
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    +15.2% vs période précédente
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Modèles IA Actifs
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data?.intelligence.models.filter(m => m.status === 'deployed').length || 0}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Sur {data?.intelligence.models.length || 0} modèles
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Précision Moyenne IA
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data?.intelligence.models ? (data.intelligence.models.reduce((acc, m) => acc + m.accuracy, 0) / data.intelligence.models.length).toFixed(1) : '0'}%
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Excellent niveau
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Clients à Risque
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    38
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Nécessite attention
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ML Models Management */}
        {data?.intelligence && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Modèles Machine Learning
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestion et monitoring des modèles IA
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.intelligence.models.map((model) => (
                  <motion.div
                    key={model.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {model.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {getModelStatusIcon(model.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModelStatusColor(model.status)}`}>
                          {model.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="font-medium capitalize">{model.type}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Précision:</span>
                        <span className={`font-medium ${
                          model.accuracy > 90 ? 'text-green-600' :
                          model.accuracy > 80 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {model.accuracy.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Prédictions:</span>
                        <span className="font-medium">{model.predictions_count.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => trainModel(model.name)}
                        loading={trainingModel === model.name}
                        className="flex-1"
                      >
                        {trainingModel === model.name ? (
                          <Cpu className="w-4 h-4 mr-1" />
                        ) : (
                          <Zap className="w-4 h-4 mr-1" />
                        )}
                        {trainingModel === model.name ? 'Entraînement...' : 'Entraîner'}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Charts */}
        {data?.analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Forecast */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Prédiction de Revenus (IA)
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Modèle ML avec confiance de prédiction
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.analytics.predictions.revenue_forecast}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" className="text-xs" />
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
                      dataKey="predicted" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Client Segments */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Analyse des Segments Clients
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Distribution et évolution des segments
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.analytics.clients.segments}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {data.analytics.clients.segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSegmentColor(entry.segment)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {data.analytics.clients.segments.map((segment) => (
                    <div key={segment.segment} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getSegmentColor(segment.segment) }}
                        />
                        <span className="text-sm font-medium">{segment.segment}</span>
                      </div>
                      <span className="text-sm text-gray-500">{segment.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Operator Performance */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance par Opérateur
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Analyse comparative des opérateurs
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.analytics.operators.performance}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="transactions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Client Acquisition */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Acquisition de Clients
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tendance d'acquisition et croissance
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.analytics.clients.acquisition}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" className="text-xs" />
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
                      dataKey="new_clients" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Business Intelligence */}
        {data?.intelligence.businessIntel && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Prévisions Business IA
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Prédictions de revenus et opportunités d'optimisation
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Revenus prédits (7 jours)
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Confiance: {data.intelligence.businessIntel.revenue_forecast.confidence}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.intelligence.businessIntel.revenue_forecast.next_7_days.toLocaleString()} DZD
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Revenus prédits (30 jours)
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Croissance: +{data.intelligence.businessIntel.market_trends.growth_rate}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.intelligence.businessIntel.revenue_forecast.next_30_days.toLocaleString()} DZD
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Optimisations Pricing IA
                    </h4>
                    <div className="space-y-2">
                      {data.intelligence.businessIntel.optimization_opportunities.pricing.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm bg-blue-50 dark:bg-blue-900 p-2 rounded">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Recommandations Marketing
                    </h4>
                    <div className="space-y-2">
                      {data.intelligence.businessIntel.optimization_opportunities.marketing.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm bg-green-50 dark:bg-green-900 p-2 rounded">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client Insights */}
        {data?.intelligence.insights && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Insights Clients IA
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Analyse comportementale et prédictions personnalisées
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.intelligence.insights.map((insight) => (
                  <motion.div
                    key={insight.client_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {insight.phone}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.segment === 'VIP' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          insight.segment === 'REGULAR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {insight.segment}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risque de Churn</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                insight.churn_probability < 30 ? 'bg-green-500' :
                                insight.churn_probability < 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${insight.churn_probability}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getChurnRiskColor(insight.churn_probability)}`}>
                            {insight.churn_probability.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valeur Vie Client</p>
                        <p className="font-semibold text-lg">
                          {insight.lifetime_value.toLocaleString()} DZD
                        </p>
                        <p className="text-sm text-gray-500">
                          Score: {insight.behavioral_score}/100
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prochaine Transaction</p>
                        <p className="font-semibold">
                          {insight.next_transaction_prediction.amount.toLocaleString()} DZD
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(insight.next_transaction_prediction.date).toLocaleDateString('fr-FR')} 
                          ({insight.next_transaction_prediction.confidence}% confiance)
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Recommandations IA
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {insight.recommendations.map((rec, index) => (
                          <div key={index} className="text-xs bg-blue-50 dark:bg-blue-900 p-2 rounded">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Analysis */}
        {data?.analytics && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analyse de Risque Client (ML)
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Détection automatique des clients à risque avec scoring IA
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {data.analytics.predictions.client_churn.map((item) => (
                  <div key={item.segment} className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{item.segment}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.risk_score > 50 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        item.risk_score > 30 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {item.risk_score}% risque
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.risk_score > 50 ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-lg font-bold">{item.count}</span>
                      <span className="text-sm text-gray-500">clients</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLoader>
  )
}