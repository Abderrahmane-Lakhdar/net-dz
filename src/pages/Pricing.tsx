import React, { useState } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Target,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Percent
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/PageLoader'
import { usePageLoader } from '../hooks/usePageLoader'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'

interface PricingRule {
  id: string
  operator_id: string
  client_segment: 'VIP' | 'REGULAR' | 'NEW' | 'RISK' | 'ALL'
  min_amount: number
  max_amount: number | null
  commission_rate: number
  fixed_commission: number | null
  is_active: boolean
  valid_from: string
  valid_until: string | null
  created_at: string
  updated_at: string
  operators?: { name: string; code: string }
}

interface PricingAnalytics {
  revenue_by_segment: Array<{ segment: string; revenue: number; transactions: number }>
  commission_trends: Array<{ date: string; total_commission: number; avg_rate: number }>
  operator_performance: Array<{ operator: string; revenue: number; avg_commission: number }>
  optimization_suggestions: Array<{ type: string; message: string; impact: number }>
}

interface DynamicPricing {
  enabled: boolean
  rules: Array<{
    condition: string
    adjustment: number
    description: string
  }>
}

interface PricingData {
  pricingRules: PricingRule[]
  analytics: PricingAnalytics
  dynamicPricing: DynamicPricing
}

const loadPricingData = async (): Promise<PricingData> => {
  const { data, error } = await supabase
    .from('pricing_rules')
    .select(`
      *,
      operators (name, code)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Simuler les analytics
  const mockAnalytics: PricingAnalytics = {
    revenue_by_segment: [
      { segment: 'VIP', revenue: 450000, transactions: 156 },
      { segment: 'REGULAR', revenue: 780000, transactions: 342 },
      { segment: 'NEW', revenue: 230000, transactions: 189 },
      { segment: 'RISK', revenue: 120000, transactions: 67 }
    ],
    commission_trends: [
      { date: '20/01', total_commission: 45000, avg_rate: 2.8 },
      { date: '21/01', total_commission: 52000, avg_rate: 2.9 },
      { date: '22/01', total_commission: 38000, avg_rate: 2.7 },
      { date: '23/01', total_commission: 61000, avg_rate: 3.1 },
      { date: '24/01', total_commission: 73000, avg_rate: 3.2 },
      { date: '25/01', total_commission: 89000, avg_rate: 3.4 },
      { date: '26/01', total_commission: 67000, avg_rate: 3.0 }
    ],
    operator_performance: [
      { operator: 'Djezzy', revenue: 156000, avg_commission: 3.2 },
      { operator: 'Mobilis', revenue: 124000, avg_commission: 2.9 },
      { operator: 'Ooredoo', revenue: 98000, avg_commission: 3.1 }
    ],
    optimization_suggestions: [
      {
        type: 'increase',
        message: 'Augmenter les commissions VIP de 0.2% pourrait générer +15% de revenus',
        impact: 15
      },
      {
        type: 'decrease',
        message: 'Réduire les commissions NEW de 0.3% pourrait augmenter le volume de 25%',
        impact: 25
      },
      {
        type: 'dynamic',
        message: 'Activer le pricing dynamique pourrait optimiser les revenus de 12%',
        impact: 12
      }
    ]
  }

  const mockDynamicPricing: DynamicPricing = {
    enabled: false,
    rules: [
      {
        condition: 'Volume élevé (>100 trans/jour)',
        adjustment: -0.2,
        description: 'Réduction de commission pour encourager le volume'
      },
      {
        condition: 'Heures de pointe (9h-17h)',
        adjustment: +0.3,
        description: 'Augmentation pendant les heures chargées'
      },
      {
        condition: 'Weekend',
        adjustment: -0.1,
        description: 'Promotion weekend'
      },
      {
        condition: 'Client VIP fidèle',
        adjustment: -0.5,
        description: 'Tarif préférentiel pour la fidélité'
      }
    ]
  }

  return {
    pricingRules: data || [],
    analytics: mockAnalytics,
    dynamicPricing: mockDynamicPricing
  }
}

export function Pricing() {
  const { loading, data, error, isStructureLoading, isDataLoading, reload } = usePageLoader(
    loadPricingData,
    {
      cacheKey: 'pricing',
      structureDelay: 0,
      dataDelay: 0
    }
  )

  const [showAddRule, setShowAddRule] = useState(false)
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null)

  const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId)

      if (error) throw error

      toast.success(`Règle ${!currentStatus ? 'activée' : 'désactivée'}`)
      reload()
    } catch (error) {
      console.error('Error toggling rule status:', error)
      toast.error('Erreur lors de la modification de la règle')
    }
  }

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) return

    try {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', ruleId)

      if (error) throw error

      toast.success('Règle supprimée')
      reload()
    } catch (error) {
      console.error('Error deleting rule:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const toggleDynamicPricing = () => {
    toast.success(`Pricing dynamique ${data?.dynamicPricing.enabled ? 'désactivé' : 'activé'}`)
  }

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'REGULAR':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
      case 'NEW':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'RISK':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      case 'ALL':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
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
      title="Chargement du système de pricing"
      onRetry={reload}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pricing Dynamique
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Règles de commission avancées et optimisation automatique
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            
            <Button onClick={() => setShowAddRule(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Règle
            </Button>
          </div>
        </div>

        {/* Pricing Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Revenus Commission
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    425K DZD
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    +18.2% ce mois
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Taux Moyen
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    3.1%
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Optimal
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Percent className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Règles Actives
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data?.pricingRules.filter(r => r.is_active).length || 0}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Sur {data?.pricingRules.length || 0} règles
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Optimisation IA
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    +12%
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Potentiel gain
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Pricing */}
        {data?.dynamicPricing && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pricing Dynamique IA
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ajustement automatique des commissions basé sur l'IA
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                    data.dynamicPricing.enabled 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      data.dynamicPricing.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {data.dynamicPricing.enabled ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <Button
                    variant={data.dynamicPricing.enabled ? 'outline' : 'primary'}
                    size="sm"
                    onClick={toggleDynamicPricing}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {data.dynamicPricing.enabled ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.dynamicPricing.rules.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      data.dynamicPricing.enabled 
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {rule.condition}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rule.adjustment > 0 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {rule.adjustment > 0 ? '+' : ''}{rule.adjustment}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {rule.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Charts */}
        {data?.analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Revenus par Segment
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Performance des différents segments clients
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.analytics.revenue_by_segment}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="segment" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tendances Commission
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Évolution des commissions sur 7 jours
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.analytics.commission_trends}>
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
                      dataKey="total_commission" 
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

        {/* Optimization Suggestions */}
        {data?.analytics && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Suggestions d'Optimisation IA
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recommandations automatiques pour maximiser les revenus
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.analytics.optimization_suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Impact estimé:
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          suggestion.impact > 20 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          suggestion.impact > 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          +{suggestion.impact}%
                        </span>
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

        {/* Pricing Rules */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Règles de Pricing
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data?.pricingRules.length || 0} règle(s) configurée(s)
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Opérateur
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Segment
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Montant
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Commission
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Validité
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {(data?.pricingRules || []).map((rule) => (
                      <motion.tr
                        key={rule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border-b border-gray-100 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium">
                            {rule.operators?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(rule.client_segment)}`}>
                            {rule.client_segment}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p>{rule.min_amount.toLocaleString()} DZD</p>
                            {rule.max_amount && (
                              <p className="text-gray-500">
                                à {rule.max_amount.toLocaleString()} DZD
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {rule.fixed_commission ? (
                              <p className="font-semibold">
                                {rule.fixed_commission.toLocaleString()} DZD
                              </p>
                            ) : (
                              <p className="font-semibold">
                                {(rule.commission_rate * 100).toFixed(2)}%
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {rule.is_active ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-gray-500" />
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rule.is_active 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p>{new Date(rule.valid_from).toLocaleDateString('fr-FR')}</p>
                            {rule.valid_until && (
                              <p className="text-gray-500">
                                à {new Date(rule.valid_until).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRuleStatus(rule.id, rule.is_active)}
                            >
                              {rule.is_active ? (
                                <AlertTriangle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRule(rule)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRule(rule.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {(data?.pricingRules || []).length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucune règle de pricing configurée
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