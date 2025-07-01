import { 
  Users, 
  TrendingUp, 
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { StatsCard } from '../components/dashboard/StatsCard'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { PageLoader } from '../components/ui/PageLoader'
import { usePageLoader } from '../hooks/usePageLoader'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../lib/supabase'

interface DashboardData {
  stats: {
    totalClients: number
    totalTransactions: number
    totalRevenue: number
    activeTransactions: number
    successRate: number
    totalSims: number
    activeSims: number
    totalOperators: number
  }
  recentTransactions: Array<{
    id: string
    amount: number
    status: string
    recipient_phone: string
    created_at: string
    clients?: { phone: string; name: string | null }
    operators?: { name: string; code: string }
  }>
  transactionTrends: Array<{ 
    date: string
    transactions: number
    amount: number
  }>
  operatorDistribution: Array<{ 
    name: string
    value: number
    color: string
  }>
  clientSegments: Array<{
    segment: string
    count: number
    percentage: number
  }>
}

const loadDashboardData = async (): Promise<DashboardData> => {
  try {
    // Charger les statistiques en parallèle
    const [
      clientsResult,
      transactionsResult,
      simsResult,
      operatorsResult,
      recentTransactionsResult
    ] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('amount, commission, status, created_at'),
      supabase.from('sims').select('*', { count: 'exact', head: true }),
      supabase.from('operators').select('*', { count: 'exact', head: true }),
      supabase
        .from('transactions')
        .select(`
          id,
          amount,
          status,
          recipient_phone,
          created_at,
          clients (phone, name),
          operators (name, code)
        `)
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    if (clientsResult.error) throw clientsResult.error
    if (transactionsResult.error) throw transactionsResult.error
    if (simsResult.error) throw simsResult.error
    if (operatorsResult.error) throw operatorsResult.error
    if (recentTransactionsResult.error) throw recentTransactionsResult.error

    const transactions = transactionsResult.data || []
    const completedTransactions = transactions.filter(t => t.status === 'completed')
    const activeTransactions = transactions.filter(t => t.status === 'processing').length
    
    // Calculer les revenus totaux (commissions)
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.commission || 0), 0)
    
    // Calculer le taux de succès
    const successRate = transactions.length ? (completedTransactions.length / transactions.length) * 100 : 0

    // Charger les segments clients
    const { data: clientSegments } = await supabase
      .from('clients')
      .select('segment')

    const segmentCounts = (clientSegments || []).reduce((acc: any, client) => {
      acc[client.segment] = (acc[client.segment] || 0) + 1
      return acc
    }, {})

    const totalClients = clientsResult.count || 0
    const segments = Object.entries(segmentCounts).map(([segment, count]: [string, any]) => ({
      segment,
      count,
      percentage: totalClients ? (count / totalClients) * 100 : 0
    }))

    // Charger les SIMs actives
    const { data: activeSims } = await supabase
      .from('sims')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Générer les tendances des transactions (derniers 7 jours)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    const transactionTrends = await Promise.all(
      last7Days.map(async (date) => {
        const { data, error } = await supabase
          .from('transactions')
          .select('amount, commission')
          .gte('created_at', `${date}T00:00:00`)
          .lt('created_at', `${date}T23:59:59`)
          .eq('status', 'completed')

        if (error) {
          console.error('Error loading transaction trends:', error)
          return { date, transactions: 0, amount: 0 }
        }

        return {
          date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          transactions: data.length,
          amount: data.reduce((sum, t) => sum + t.amount, 0)
        }
      })
    )

    // Distribution par opérateur
    const { data: operatorStats } = await supabase
      .from('transactions')
      .select(`
        operators (name, code),
        amount
      `)
      .eq('status', 'completed')

    const operatorCounts = (operatorStats || []).reduce((acc: any, transaction) => {
      const operatorName = transaction.operators?.name || 'Inconnu'
      acc[operatorName] = (acc[operatorName] || 0) + 1
      return acc
    }, {})

    const operatorDistribution = Object.entries(operatorCounts).map(([name, count]: [string, any], index) => ({
      name,
      value: count,
      color: ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b'][index % 4]
    }))

    return {
      stats: {
        totalClients: totalClients,
        totalTransactions: transactions.length,
        totalRevenue: totalRevenue,
        activeTransactions: activeTransactions,
        successRate: successRate,
        totalSims: simsResult.count || 0,
        activeSims: activeSims?.count || 0,
        totalOperators: operatorsResult.count || 0
      },
      recentTransactions: recentTransactionsResult.data || [],
      transactionTrends,
      operatorDistribution,
      clientSegments: segments
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    throw error
  }
}

export function Dashboard() {
  const { data, error, isStructureLoading, isDataLoading, reload } = usePageLoader(
    loadDashboardData,
    {
      cacheKey: 'dashboard',
      structureDelay: 0,
      dataDelay: 0
    }
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-secondary-500" />
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-accent-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-secondary-600 bg-secondary-100 dark:text-secondary-400 dark:bg-secondary-900'
      case 'processing':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'failed':
        return 'text-accent-600 bg-accent-100 dark:text-accent-400 dark:bg-accent-900'
      default:
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
    }
  }

  return (
    <PageLoader
      isStructureLoading={isStructureLoading}
      isDataLoading={isDataLoading}
      error={error}
      title="Chargement du tableau de bord"
      onRetry={reload}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clients"
            value={data?.stats.totalClients.toLocaleString() || '0'}
            change={`${data?.clientSegments.length || 0} segments`}
            changeType="neutral"
            icon={Users}
            color="primary"
          />
          <StatsCard
            title="Transactions Actives"
            value={data?.stats.activeTransactions || 0}
            change="En cours"
            changeType="neutral"
            icon={Activity}
            color="warning"
          />
          <StatsCard
            title="Revenus Totaux"
            value={`${data?.stats.totalRevenue.toLocaleString() || '0'} DZD`}
            change={`${data?.stats.totalTransactions || 0} transactions`}
            changeType="positive"
            icon={DollarSign}
            color="secondary"
          />
          <StatsCard
            title="Taux de Réussite"
            value={`${data?.stats.successRate.toFixed(1) || '0'}%`}
            change={`${data?.stats.activeSims || 0}/${data?.stats.totalSims || 0} SIMs actives`}
            changeType="positive"
            icon={TrendingUp}
            color="accent"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Trends */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tendances des Transactions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Volume et montants sur 7 jours
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.transactionTrends || []}>
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
                    dataKey="transactions" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Operator Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Répartition par Opérateur
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Distribution des transactions
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.operatorDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(data?.operatorDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-4">
                {(data?.operatorDistribution || []).map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Segments */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Segments Clients
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Distribution des clients par segment
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.clientSegments || []}>
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
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Transactions Récentes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dernières activités en temps réel
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Destinataire
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Montant
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Opérateur
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentTransactions || []).map((transaction) => (
                    <tr 
                      key={transaction.id}
                      className="border-b border-gray-100 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">
                          {transaction.clients?.phone || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">
                          {transaction.recipient_phone}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          {transaction.amount.toLocaleString()} DZD
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.operators?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transaction.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.created_at).toLocaleString('fr-FR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {(data?.recentTransactions || []).length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucune transaction récente
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