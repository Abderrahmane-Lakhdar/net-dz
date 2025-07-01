import { useState } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  AlertTriangle,
  Star,
  Activity,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/PageLoader'
import { usePageLoader } from '../hooks/usePageLoader'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

interface Client {
  id: string
  phone: string
  name: string | null
  segment: 'VIP' | 'REGULAR' | 'NEW' | 'RISK'
  risk_score: number
  total_transactions: number
  total_amount: number
  average_amount: number
  frequency: number
  last_activity: string | null
  preferred_operator: string | null
  behavior_patterns: any
  created_at: string
  updated_at: string
  operators?: { name: string; code: string }
}

interface ClientStats {
  total: number
  new: number
  regular: number
  vip: number
  risk: number
}

interface ClientsData {
  clients: Client[]
  stats: ClientStats
}

const loadClientsData = async (): Promise<ClientsData> => {
  const [clientsResult, statsResult] = await Promise.all([
    supabase
      .from('clients')
      .select(`
        *,
        operators (name, code)
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('segment')
  ])

  if (clientsResult.error) throw clientsResult.error
  if (statsResult.error) throw statsResult.error

  const stats = (statsResult.data || []).reduce((acc, client) => {
    acc.total++
    acc[client.segment.toLowerCase() as keyof ClientStats]++
    return acc
  }, { total: 0, new: 0, regular: 0, vip: 0, risk: 0 })

  return {
    clients: clientsResult.data || [],
    stats
  }
}

export function Clients() {
  const { data, error, isStructureLoading, isDataLoading, reload } = usePageLoader(
    loadClientsData,
    {
      cacheKey: 'clients',
      structureDelay: 0,
      dataDelay: 0 // Suppression du délai pour un affichage immédiat
    }
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [segmentFilter, setSegmentFilter] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'VIP':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'REGULAR':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'NEW':
        return <Plus className="w-4 h-4 text-green-500" />
      case 'RISK':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Users className="w-4 h-4 text-gray-500" />
    }
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
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-600'
    if (score <= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredClients = (data?.clients || []).filter(client => {
    const matchesSearch = client.phone.includes(searchTerm) ||
                         client.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSegment = segmentFilter === 'all' || client.segment === segmentFilter
    
    return matchesSearch && matchesSegment
  })

  return (
    <PageLoader
      isStructureLoading={isStructureLoading}
      isDataLoading={isDataLoading}
      error={error}
      title="Chargement des clients"
      onRetry={reload}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Clients
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Profiling automatique et segmentation intelligente
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Clients
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data?.stats.total || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Nouveaux
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {data?.stats.new || 0}
                  </p>
                </div>
                <Plus className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Réguliers
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {data?.stats.regular || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    VIP
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {data?.stats.vip || 0}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    À Risque
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {data?.stats.risk || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par téléphone ou nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={segmentFilter}
                  onChange={(e) => setSegmentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Tous les segments</option>
                  <option value="NEW">Nouveaux</option>
                  <option value="REGULAR">Réguliers</option>
                  <option value="VIP">VIP</option>
                  <option value="RISK">À Risque</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Liste des Clients
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredClients.length} client(s) trouvé(s)
            </p>
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
                      Segment
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Score Risque
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Transactions
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Volume Total
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Dernière Activité
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredClients.map((client) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border-b border-gray-100 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                              <Phone className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {client.name || 'Client'}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                {client.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getSegmentIcon(client.segment)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(client.segment)}`}>
                              {client.segment}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-12 bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getRiskScoreColor(client.risk_score).replace('text-', 'bg-')}`}
                                style={{ width: `${client.risk_score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${getRiskScoreColor(client.risk_score)}`}>
                              {client.risk_score}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {client.total_transactions}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-semibold text-sm">
                                {client.total_amount.toLocaleString()} DZD
                              </p>
                              <p className="text-xs text-gray-500">
                                Moy: {client.average_amount.toLocaleString()} DZD
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div className="text-sm">
                              {client.last_activity ? (
                                <>
                                  <p>{new Date(client.last_activity).toLocaleDateString('fr-FR')}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(client.last_activity).toLocaleTimeString('fr-FR')}
                                  </p>
                                </>
                              ) : (
                                <p className="text-gray-500">Jamais</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClient(client)}
                          >
                            Détails
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {filteredClients.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun client trouvé
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client Details Modal */}
        <AnimatePresence>
          {selectedClient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedClient(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Profil Client Détaillé
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedClient(null)}
                    >
                      ×
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Téléphone
                        </label>
                        <p className="font-mono text-lg">{selectedClient.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Nom
                        </label>
                        <p className="text-lg">{selectedClient.name || 'Non renseigné'}</p>
                      </div>
                    </div>

                    {/* Segment & Risk */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Segment
                        </label>
                        <div className="flex items-center space-x-2">
                          {getSegmentIcon(selectedClient.segment)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSegmentColor(selectedClient.segment)}`}>
                            {selectedClient.segment}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Score de Risque
                        </label>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 dark:bg-dark-700 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${getRiskScoreColor(selectedClient.risk_score).replace('text-', 'bg-')}`}
                              style={{ width: `${selectedClient.risk_score}%` }}
                            />
                          </div>
                          <span className={`text-lg font-bold ${getRiskScoreColor(selectedClient.risk_score)}`}>
                            {selectedClient.risk_score}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Total Transactions
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedClient.total_transactions}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Volume Total
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedClient.total_amount.toLocaleString()} DZD
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Montant Moyen
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedClient.average_amount.toLocaleString()} DZD
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Fréquence
                        </label>
                        <p className="text-lg">{selectedClient.frequency.toFixed(2)} trans/jour</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Opérateur Préféré
                        </label>
                        <p className="text-lg">
                          {selectedClient.operators?.name || 'Aucun'}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Client depuis
                        </label>
                        <p className="text-lg">
                          {new Date(selectedClient.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Dernière Activité
                        </label>
                        <p className="text-lg">
                          {selectedClient.last_activity 
                            ? new Date(selectedClient.last_activity).toLocaleDateString('fr-FR')
                            : 'Jamais'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLoader>
  )
}