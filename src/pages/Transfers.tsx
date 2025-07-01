import { useState } from 'react'
import { 
  CreditCard, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Search,
  Filter,
  Plus,
  Phone,
  DollarSign,
  User
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/PageLoader'
import { usePageLoader } from '../hooks/usePageLoader'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface Transfer {
  id: string
  client_id: string
  operator_id: string
  sim_id: string | null
  distributor_id: string
  amount: number
  commission: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  recipient_phone: string
  ussd_response: string | null
  error_message: string | null
  retry_count: number
  created_at: string
  updated_at: string
  completed_at: string | null
  clients?: { phone: string; name: string | null; segment: string }
  operators?: { name: string; code: string }
  sims?: { phone_number: string; status: string }
}

interface Operator {
  id: string
  name: string
  code: string
  ussd_config: any
  is_active: boolean
}

interface TransfersData {
  transfers: Transfer[]
  operators: Operator[]
  stats: {
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
    totalAmount: number
    totalCommission: number
  }
}

interface NewTransferForm {
  recipient_phone: string
  amount: string
  operator_id: string
  client_phone: string
}

const loadTransfersData = async (): Promise<TransfersData> => {
  try {
    const [transfersResult, operatorsResult] = await Promise.all([
      supabase
        .from('transactions')
        .select(`
          *,
          clients (phone, name, segment),
          operators (name, code),
          sims (phone_number, status)
        `)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('operators')
        .select('*')
        .eq('is_active', true)
        .order('name')
    ])

    if (transfersResult.error) throw transfersResult.error
    if (operatorsResult.error) throw operatorsResult.error

    const transfers = transfersResult.data || []
    
    // Calculer les statistiques
    const stats = {
      total: transfers.length,
      pending: transfers.filter(t => t.status === 'pending').length,
      processing: transfers.filter(t => t.status === 'processing').length,
      completed: transfers.filter(t => t.status === 'completed').length,
      failed: transfers.filter(t => t.status === 'failed').length,
      totalAmount: transfers.reduce((sum, t) => sum + t.amount, 0),
      totalCommission: transfers.reduce((sum, t) => sum + t.commission, 0)
    }

    return {
      transfers,
      operators: operatorsResult.data || [],
      stats
    }
  } catch (error) {
    console.error('Error loading transfers data:', error)
    throw error
  }
}

export function Transfers() {
  const { data, error, isStructureLoading, isDataLoading, reload } = usePageLoader(
    loadTransfersData,
    {
      cacheKey: 'transfers',
      structureDelay: 0,
      dataDelay: 0
    }
  )

  const [showNewTransfer, setShowNewTransfer] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [submitting, setSubmitting] = useState(false)
  
  const [newTransfer, setNewTransfer] = useState<NewTransferForm>({
    recipient_phone: '',
    amount: '',
    operator_id: '',
    client_phone: ''
  })

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const amount = parseFloat(newTransfer.amount)
      if (amount < 5000) {
        toast.error('Le montant minimum est de 5000 DZD')
        return
      }

      if (!newTransfer.recipient_phone.match(/^(\+213|0)[5-7]\d{8}$/)) {
        toast.error('Numéro de téléphone invalide (format: +213XXXXXXXXX ou 0XXXXXXXXX)')
        return
      }

      const clientId = await getOrCreateClient(newTransfer.client_phone)
      
      const { data: distributors } = await supabase
        .from('distributors')
        .select('id')
        .eq('is_active', true)
        .limit(1)

      if (!distributors || distributors.length === 0) {
        toast.error('Aucun distributeur actif trouvé')
        return
      }

      const commission = await calculateCommission(amount, newTransfer.operator_id, clientId)

      const { data: newTransferData, error } = await supabase
        .from('transactions')
        .insert({
          client_id: clientId,
          operator_id: newTransfer.operator_id,
          distributor_id: distributors[0].id,
          amount: amount,
          commission: commission,
          recipient_phone: newTransfer.recipient_phone,
          status: 'pending'
        })
        .select()

      if (error) throw error

      toast.success('Transfert créé avec succès!')
      setShowNewTransfer(false)
      setNewTransfer({
        recipient_phone: '',
        amount: '',
        operator_id: '',
        client_phone: ''
      })
      
      reload()
      
      // Simuler le traitement du transfert
      setTimeout(() => {
        processTransfer(newTransferData[0].id)
      }, 2000)

    } catch (error: any) {
      console.error('Error creating transfer:', error)
      toast.error(error.message || 'Erreur lors de la création du transfert')
    } finally {
      setSubmitting(false)
    }
  }

  const getOrCreateClient = async (phone: string): Promise<string> => {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingClient) {
      return existingClient.id
    }

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        phone: phone,
        segment: 'NEW',
        risk_score: 0
      })
      .select('id')
      .single()

    if (error) throw error
    return newClient.id
  }

  const calculateCommission = async (amount: number, operatorId: string, clientId: string): Promise<number> => {
    const { data: client } = await supabase
      .from('clients')
      .select('segment')
      .eq('id', clientId)
      .single()

    const segment = client?.segment || 'NEW'

    const { data: pricingRule } = await supabase
      .from('pricing_rules')
      .select('commission_rate, fixed_commission')
      .eq('operator_id', operatorId)
      .eq('client_segment', segment)
      .eq('is_active', true)
      .lte('min_amount', amount)
      .or(`max_amount.gte.${amount},max_amount.is.null`)
      .single()

    if (pricingRule) {
      if (pricingRule.fixed_commission) {
        return pricingRule.fixed_commission
      } else {
        return amount * pricingRule.commission_rate
      }
    }

    // Taux par défaut si aucune règle trouvée
    return amount * 0.025
  }

  const processTransfer = async (transferId: string) => {
    try {
      await supabase
        .from('transactions')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', transferId)

      setTimeout(async () => {
        const isSuccess = Math.random() > 0.1 // 90% de succès

        await supabase
          .from('transactions')
          .update({
            status: isSuccess ? 'completed' : 'failed',
            completed_at: isSuccess ? new Date().toISOString() : null,
            ussd_response: isSuccess ? 'Transfert effectué avec succès' : null,
            error_message: isSuccess ? null : 'Solde insuffisant sur la SIM',
            updated_at: new Date().toISOString()
          })
          .eq('id', transferId)

        if (isSuccess) {
          toast.success('Transfert complété avec succès!')
        } else {
          toast.error('Échec du transfert')
        }
        
        reload()
      }, 3000)

    } catch (error) {
      console.error('Error processing transfer:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-secondary-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-accent-500" />
      case 'cancelled':
        return <X className="w-5 h-5 text-gray-500" />
      default:
        return <Clock className="w-5 h-5 text-blue-500" />
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
      case 'cancelled':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
      default:
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
    }
  }

  const filteredTransfers = (data?.transfers || []).filter(transfer => {
    const matchesSearch = transfer.recipient_phone.includes(searchTerm) ||
                         transfer.clients?.phone.includes(searchTerm) ||
                         transfer.operators?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <PageLoader
      isStructureLoading={isStructureLoading}
      isDataLoading={isDataLoading}
      error={error}
      title="Chargement des transferts"
      onRetry={reload}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transferts de Crédit
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestion des transferts avec validation automatique
            </p>
          </div>
          
          <Button
            onClick={() => setShowNewTransfer(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Transfert</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data?.stats.total || 0}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    En attente
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {data?.stats.pending || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    En cours
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {data?.stats.processing || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500 animate-spin" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Complétés
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {data?.stats.completed || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Revenus
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {data?.stats.totalCommission.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500">DZD</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
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
                    placeholder="Rechercher par téléphone, client ou opérateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="processing">En cours</option>
                  <option value="completed">Complété</option>
                  <option value="failed">Échoué</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transfers List */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Historique des Transferts
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredTransfers.length} transfert(s) trouvé(s)
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
                      Destinataire
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Montant
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Commission
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
                  <AnimatePresence>
                    {filteredTransfers.map((transfer) => (
                      <motion.tr
                        key={transfer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border-b border-gray-100 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">
                                {transfer.clients?.name || 'Client'}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                {transfer.clients?.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-sm">
                              {transfer.recipient_phone}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-semibold">
                                {transfer.amount.toLocaleString()} DZD
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-green-600">
                            {transfer.commission.toLocaleString()} DZD
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium">
                            {transfer.operators?.name}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(transfer.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                              {transfer.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p>{new Date(transfer.created_at).toLocaleDateString('fr-FR')}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(transfer.created_at).toLocaleTimeString('fr-FR')}
                            </p>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {filteredTransfers.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun transfert trouvé
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* New Transfer Modal */}
        <AnimatePresence>
          {showNewTransfer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowNewTransfer(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Nouveau Transfert
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewTransfer(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmitTransfer} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Téléphone Client
                      </label>
                      <input
                        type="tel"
                        value={newTransfer.client_phone}
                        onChange={(e) => setNewTransfer({ ...newTransfer, client_phone: e.target.value })}
                        placeholder="+213555123456"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Téléphone Destinataire
                      </label>
                      <input
                        type="tel"
                        value={newTransfer.recipient_phone}
                        onChange={(e) => setNewTransfer({ ...newTransfer, recipient_phone: e.target.value })}
                        placeholder="+213666789012"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Montant (DZD)
                      </label>
                      <input
                        type="number"
                        min="5000"
                        step="100"
                        value={newTransfer.amount}
                        onChange={(e) => setNewTransfer({ ...newTransfer, amount: e.target.value })}
                        placeholder="5000"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Montant minimum: 5000 DZD
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Opérateur
                      </label>
                      <select
                        value={newTransfer.operator_id}
                        onChange={(e) => setNewTransfer({ ...newTransfer, operator_id: e.target.value })}
                
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                        required
                      >
                        <option value="">Sélectionner un opérateur</option>
                        {(data?.operators || []).map((operator) => (
                          <option key={operator.id} value={operator.id}>
                            {operator.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewTransfer(false)}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        loading={submitting}
                        className="flex-1"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Créer Transfert
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLoader>
  )
}