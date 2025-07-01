import { useState } from 'react'
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Send,
  Zap,
  Signal,
  Battery,
  Clock,
  Phone,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Loader2
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/PageLoader'
import { usePageLoader } from '../hooks/usePageLoader'
import { useModemManager } from '../hooks/useModemManager'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface USSDTestForm {
  portPath: string
  ussdCode: string
}

interface TransferTestForm {
  portPath: string
  amount: string
  recipientPhone: string
}

const loadSimsUssdData = async () => {
  // Cette fonction charge les données statiques de configuration USSD
  return {
    operators: [
      {
        name: 'Djezzy',
        code: 'DJZ',
        transferCode: '*555*{amount}*{phone}#',
        balanceCode: '*555#',
        color: 'from-blue-500 to-blue-600'
      },
      {
        name: 'Mobilis',
        code: 'MOB',
        transferCode: '*606*{amount}*{phone}#',
        balanceCode: '*606#',
        color: 'from-green-500 to-green-600'
      },
      {
        name: 'Ooredoo',
        code: 'OOR',
        transferCode: '*100*{amount}*{phone}#',
        balanceCode: '*100#',
        color: 'from-red-500 to-red-600'
      }
    ]
  }
}

export function SimsUssd() {
  const { data: staticData, error: staticError, isStructureLoading, reload: reloadStatic } = usePageLoader(
    loadSimsUssdData,
    {
      cacheKey: 'sims-ussd-static',
      structureDelay: 0,
      dataDelay: 0
    }
  )

  // Hook pour la gestion des modems via WebSocket
  const {
    modems,
    ussdLogs,
    isLoading: modemsLoading,
    error: modemsError,
    isConnected,
    connectionStatus,
    refreshModems,
    testBalance,
    sendTransfer,
    sendCustomUSSD,
    scanModems,
    reconnect,
    wsUrl
  } = useModemManager()

  const [ussdTestForm, setUssdTestForm] = useState<USSDTestForm>({
    portPath: '',
    ussdCode: ''
  })

  const [transferTestForm, setTransferTestForm] = useState<TransferTestForm>({
    portPath: '',
    amount: '',
    recipientPhone: ''
  })

  const [testingBalance, setTestingBalance] = useState<string | null>(null)
  const [sendingTransfer, setSendingTransfer] = useState<string | null>(null)
  const [sendingUSSD, setSendingUSSD] = useState<string | null>(null)

  const handleTestBalance = async (portPath: string) => {
    setTestingBalance(portPath)
    try {
      const response = await testBalance(portPath)
      if (response.success) {
        toast.success(`Solde récupéré: ${response.response}`)
      } else {
        toast.error(`Erreur: ${response.error}`)
      }
    } catch (error) {
      toast.error('Erreur lors du test de solde')
    } finally {
      setTestingBalance(null)
    }
  }

  const handleSendTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferTestForm.portPath || !transferTestForm.amount || !transferTestForm.recipientPhone) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setSendingTransfer(transferTestForm.portPath)
    try {
      const amount = parseFloat(transferTestForm.amount)
      const response = await sendTransfer(
        transferTestForm.portPath,
        amount,
        transferTestForm.recipientPhone
      )
      
      if (response.success) {
        toast.success('Transfert envoyé avec succès!')
        setTransferTestForm({ portPath: '', amount: '', recipientPhone: '' })
      } else {
        toast.error(`Erreur: ${response.error}`)
      }
    } catch (error) {
      toast.error('Erreur lors du transfert')
    } finally {
      setSendingTransfer(null)
    }
  }

  const handleSendUSSD = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ussdTestForm.portPath || !ussdTestForm.ussdCode) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setSendingUSSD(ussdTestForm.portPath)
    try {
      const response = await sendCustomUSSD(ussdTestForm.portPath, ussdTestForm.ussdCode)
      
      if (response.success) {
        toast.success('Commande USSD envoyée avec succès!')
        setUssdTestForm({ portPath: '', ussdCode: '' })
      } else {
        toast.error(`Erreur: ${response.error}`)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi USSD')
    } finally {
      setSendingUSSD(null)
    }
  }

  const getModemStatusIcon = (modem: any) => {
    if (!modem.isConnected) {
      return <WifiOff className="w-5 h-5 text-red-500" />
    }
    if (modem.simStatus !== 'present') {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />
  }

  const getSignalBars = (strength: number) => {
    const bars = Math.ceil((strength / 100) * 4)
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-1 h-4 rounded-sm ${
          i < bars ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        style={{ height: `${(i + 1) * 25}%` }}
      />
    ))
  }

  const formatLastActivity = (lastActivity: Date) => {
    const now = new Date()
    const diff = now.getTime() - lastActivity.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`
    const days = Math.floor(hours / 24)
    return `Il y a ${days}j`
  }

  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connecting':
        return {
          icon: <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />,
          text: 'Connexion en cours...',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900'
        }
      case 'connected':
        return {
          icon: <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />,
          text: 'Connecté via tunnel Cloudflare',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900'
        }
      case 'error':
        return {
          icon: <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />,
          text: 'Erreur de connexion',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900'
        }
      default:
        return {
          icon: <WifiOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
          text: 'Déconnecté',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900'
        }
    }
  }

  const connectionDisplay = getConnectionStatusDisplay()

  return (
    <PageLoader
      isStructureLoading={isStructureLoading}
      isDataLoading={false}
      error={staticError}
      title="Chargement de la configuration USSD"
      onRetry={reloadStatic}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              SIMs & USSD
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Communication via tunnel Cloudflare avec le serveur modem-sim-server local
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {connectionDisplay.text}
              </span>
            </div>
            
            <Button variant="outline" size="sm" onClick={refreshModems} disabled={!isConnected}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            
            <Button onClick={scanModems} size="sm" disabled={!isConnected}>
              <Smartphone className="w-4 h-4 mr-2" />
              Scanner
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${connectionDisplay.bgColor} rounded-full flex items-center justify-center`}>
                  {connectionDisplay.icon}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Tunnel Cloudflare
                  </h3>
                  <p className={`text-sm ${connectionDisplay.color}`}>
                    {connectionDisplay.text}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {!isConnected && (
                  <Button variant="outline" size="sm" onClick={reconnect}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reconnecter
                  </Button>
                )}
                
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    URL configurée:
                  </p>
                  <code className="block text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {wsUrl}
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {modemsError && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Problème de connexion au serveur
                  </h4>
                  <div className="bg-red-50 dark:bg-red-900 p-3 rounded-lg mb-3">
                    <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
                      {modemsError}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-2"><strong>Pour résoudre ce problème:</strong></p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Ouvrez un terminal dans le dossier <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">modem-sim-server</code></li>
                      <li>Exécutez <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npm run dev</code> pour démarrer le serveur local</li>
                      <li>Démarrez le tunnel Cloudflare: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">cloudflared tunnel --config cloudflare-tunnel-config.yml run</code></li>
                      <li>Testez la connexion WebSocket: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">wscat -c {wsUrl}</code></li>
                      <li>Cliquez sur "Reconnecter" une fois le tunnel opérationnel</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modems physiques détectés */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Modems Physiques Détectés
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {modems.length} modem(s) détecté(s) via tunnel Cloudflare
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => window.open('/transfers', '_blank')} disabled={!isConnected}>
                  <Send className="w-4 h-4 mr-2" />
                  Transfert Rapide
                </Button>
                
                <Button variant="outline" size="sm" disabled={!isConnected}>
                  <Settings className="w-4 h-4 mr-2" />
                  USSD Personnalisé
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              modems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modems.map((modem) => (
                    <motion.div
                      key={modem.port}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getModemStatusIcon(modem)}
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {modem.port}
                          </h4>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {getSignalBars(modem.signalStrength)}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Opérateur:</span>
                          <span className="font-medium">{modem.operator || 'Inconnu'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Signal:</span>
                          <span className="font-medium">{modem.signalStrength}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">SIM:</span>
                          <span className={`font-medium ${
                            modem.simStatus === 'present' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {modem.simStatus === 'present' ? 'Présente' : 'Absente'}
                          </span>
                        </div>

                        {modem.imsi && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">IMSI:</span>
                            <span className="font-mono text-xs">{modem.imsi.slice(-6)}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Activité:</span>
                          <span className="text-xs">{formatLastActivity(modem.lastActivity)}</span>
                        </div>
                      </div>

                      {modem.error && (
                        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900 rounded text-xs text-red-700 dark:text-red-300">
                          {modem.error}
                        </div>
                      )}

                      <div className="mt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestBalance(modem.port)}
                          loading={testingBalance === modem.port}
                          disabled={modem.simStatus !== 'present'}
                          className="flex-1"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Solde
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTransferTestForm({ ...transferTestForm, portPath: modem.port })}
                          disabled={modem.simStatus !== 'present'}
                          className="flex-1"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Test
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Aucun modem détecté
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Connectez des modems GSM et cliquez sur "Scanner"
                  </p>
                  <Button onClick={scanModems}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Scanner les modems
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Connexion au tunnel Cloudflare requise
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Assurez-vous que le serveur modem-sim-server et le tunnel Cloudflare sont démarrés
                </p>
                <Button onClick={reconnect}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reconnecter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration USSD Locale */}
        {staticData?.operators && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuration USSD Locale
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Codes USSD et patterns de réponse pour les opérateurs algériens
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {staticData.operators.map((operator) => (
                  <motion.div
                    key={operator.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-dark-700"
                  >
                    <div className={`h-2 bg-gradient-to-r ${operator.color}`} />
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {operator.name}
                        </h4>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-dark-700 rounded text-xs font-mono">
                          {operator.code}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Transfert:
                          </label>
                          <code className="block text-sm bg-gray-100 dark:bg-dark-700 p-2 rounded font-mono">
                            {operator.transferCode}
                          </code>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Solde:
                          </label>
                          <code className="block text-sm bg-gray-100 dark:bg-dark-700 p-2 rounded font-mono">
                            {operator.balanceCode}
                          </code>
                        </div>

                        <div className="pt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Timeout: 30s
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Forms */}
        {isConnected && modems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transfer Test Form */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Test de Transfert
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tester un transfert de crédit via USSD
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendTransfer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Port Modem
                    </label>
                    <select
                      value={transferTestForm.portPath}
                      onChange={(e) => setTransferTestForm({ ...transferTestForm, portPath: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Sélectionner un modem</option>
                      {modems.filter(m => m.simStatus === 'present').map((modem) => (
                        <option key={modem.port} value={modem.port}>
                          {modem.port} - {modem.operator || 'Inconnu'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Montant (DZD)
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={transferTestForm.amount}
                      onChange={(e) => setTransferTestForm({ ...transferTestForm, amount: e.target.value })}
                      placeholder="1000"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone Destinataire
                    </label>
                    <input
                      type="tel"
                      value={transferTestForm.recipientPhone}
                      onChange={(e) => setTransferTestForm({ ...transferTestForm, recipientPhone: e.target.value })}
                      placeholder="+213555123456"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    loading={sendingTransfer === transferTestForm.portPath}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer Transfert Test
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Custom USSD Form */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Commande USSD Personnalisée
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Envoyer une commande USSD personnalisée
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendUSSD} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Port Modem
                    </label>
                    <select
                      value={ussdTestForm.portPath}
                      onChange={(e) => setUssdTestForm({ ...ussdTestForm, portPath: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Sélectionner un modem</option>
                      {modems.filter(m => m.simStatus === 'present').map((modem) => (
                        <option key={modem.port} value={modem.port}>
                          {modem.port} - {modem.operator || 'Inconnu'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code USSD
                    </label>
                    <input
                      type="text"
                      value={ussdTestForm.ussdCode}
                      onChange={(e) => setUssdTestForm({ ...ussdTestForm, ussdCode: e.target.value })}
                      placeholder="*555# ou *100*1000*555123456#"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white font-mono"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    loading={sendingUSSD === ussdTestForm.portPath}
                    className="w-full"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Envoyer Commande USSD
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* USSD Logs */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Logs USSD en Temps Réel
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Communication via tunnel Cloudflare
            </p>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              ussdLogs.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {ussdLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-3 rounded-lg border ${
                          log.success 
                            ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                            : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {log.success ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="font-medium text-sm">
                                {log.port} - {log.operator}
                              </span>
                              <span className="text-xs text-gray-500">
                                {log.timestamp.toLocaleTimeString('fr-FR')}
                              </span>
                            </div>
                            
                            <div className="text-sm">
                              <p className="font-mono text-xs mb-1 text-gray-600 dark:text-gray-400">
                                Commande: {log.command}
                              </p>
                              <p className={`${log.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                {log.response}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun log USSD pour le moment
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Connexion au tunnel Cloudflare requise pour afficher les logs USSD
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLoader>
  )
}