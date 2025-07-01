import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface ModemInfo {
  port: string;
  isConnected: boolean;
  operator: string | null;
  signalStrength: number;
  simStatus: 'present' | 'absent' | 'error';
  imsi: string | null;
  iccid: string | null;
  lastActivity: Date;
  error?: string;
  batteryLevel?: number;
  networkRegistration?: string;
}

export interface USSDResponse {
  success: boolean;
  response: string;
  error?: string;
  timestamp: Date;
  duration?: number;
}

export interface USSDLog {
  id: string;
  timestamp: Date;
  port: string;
  command: string;
  response: string;
  success: boolean;
  operator: string;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  id?: string;
  timestamp?: string;
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export function useModemManager() {
  const [modems, setModems] = useState<ModemInfo[]>([]);
  const [ussdLogs, setUssdLogs] = useState<USSDLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // WebSocket URL - Utilise uniquement le tunnel Cloudflare
  const wsUrl = import.meta.env.VITE_MODEM_SERVER_WS_URL || 'wss://modem-sim-server.creditpro-dz.com';

  // Generate unique request ID
  const generateRequestId = useCallback(() => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }, []);

  // Send WebSocket message with promise-based response handling
  const sendWebSocketMessage = useCallback((type: string, data?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket connection not available'));
        return;
      }

      const id = generateRequestId();
      const message: WebSocketMessage = { type, data, id };

      // Set up timeout for request
      const timeout = setTimeout(() => {
        pendingRequestsRef.current.delete(id);
        reject(new Error(`Request timeout after 30 seconds`));
      }, 30000);

      // Store pending request
      pendingRequestsRef.current.set(id, { resolve, reject, timeout });

      // Send message
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        pendingRequestsRef.current.delete(id);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }, [generateRequestId]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Handle responses to pending requests
      if (message.type === 'response' && message.id) {
        const pendingRequest = pendingRequestsRef.current.get(message.id);
        if (pendingRequest) {
          clearTimeout(pendingRequest.timeout);
          pendingRequestsRef.current.delete(message.id);
          pendingRequest.resolve(message.data);
          return;
        }
      }

      // Handle error responses
      if (message.type === 'error' && message.id) {
        const pendingRequest = pendingRequestsRef.current.get(message.id);
        if (pendingRequest) {
          clearTimeout(pendingRequest.timeout);
          pendingRequestsRef.current.delete(message.id);
          pendingRequest.reject(new Error(message.data?.error || 'Unknown error'));
          return;
        }
      }

      // Handle broadcast messages
      switch (message.type) {
        case 'status':
          if (message.data?.type === 'modems' && message.data?.modems) {
            const modemsData = message.data.modems.map((modem: any) => ({
              ...modem,
              lastActivity: new Date(modem.lastActivity)
            }));
            setModems(modemsData);
            setIsLoading(false);
          }
          break;

        case 'log':
          if (message.data?.type === 'ussd' && message.data?.log) {
            const log = message.data.log;
            const newLog: USSDLog = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              timestamp: new Date(log.timestamp),
              port: log.port,
              command: log.command || 'Unknown',
              response: log.response?.response || log.response || '',
              success: log.response?.success ?? true,
              operator: log.operator || 'Unknown'
            };
            setUssdLogs(prev => [newLog, ...prev.slice(0, 99)]);
            
            // Enregistrer le log USSD dans Supabase pour historique
            saveUSSDLogToDatabase(newLog);
          }
          break;

        default:
          console.log('Unhandled WebSocket message:', message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  // Save USSD log to database
  const saveUSSDLogToDatabase = async (log: USSDLog) => {
    try {
      // Enregistrer dans une table de logs USSD si elle existe
      // Sinon, on peut créer une transaction pour tracer l'activité
      console.log('USSD Log:', log);
      
      // Si c'est un transfert réussi, on peut créer une transaction
      if (log.success && log.command.includes('*') && log.command.includes('#')) {
        // Parser le command pour extraire les informations de transfert
        // Format attendu: *555*{amount}*{phone}# par exemple
        const transferMatch = log.command.match(/\*\d+\*(\d+)\*(\+?\d+)#/);
        if (transferMatch) {
          const [, amount, phone] = transferMatch;
          
          // Créer une transaction dans la base de données
          // Note: Ceci nécessiterait une logique plus complexe pour identifier le client, l'opérateur, etc.
          console.log('Transfer detected:', { amount, phone, port: log.port });
        }
      }
    } catch (error) {
      console.error('Error saving USSD log to database:', error);
    }
  };

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (!wsUrl) {
      setError('URL du serveur WebSocket non configurée. Vérifiez VITE_MODEM_SERVER_WS_URL dans votre fichier .env');
      setConnectionStatus('error');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Tentative de connexion WebSocket: ${wsUrl} (tentative ${reconnectAttemptsRef.current + 1})`);
      setConnectionStatus('connecting');
      setError(null);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log(`WebSocket connecté à: ${wsUrl}`);
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Request initial modem list
        sendWebSocketMessage('getModems').catch(console.error);
      };

      wsRef.current.onmessage = handleWebSocketMessage;

      wsRef.current.onerror = (event) => {
        console.error(`Erreur WebSocket pour ${wsUrl}:`, event);
        setConnectionStatus('error');
        setError('Problème de connexion détecté. Tentative de reconnexion en cours...');
      };

      wsRef.current.onclose = (event) => {
        console.log(`WebSocket déconnecté de ${wsUrl}:`, event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Clean close, don't reconnect
        if (event.code === 1000) {
          return;
        }

        // Attempt to reconnect if not exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = reconnectDelay * reconnectAttemptsRef.current;
          
          console.log(`Reconnexion dans ${delay}ms (tentative ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          setError(`Connexion perdue. Reconnexion dans ${Math.ceil(delay / 1000)}s... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          const errorMsg = `Impossible de se connecter au serveur modem après ${maxReconnectAttempts} tentatives.

Vérifications nécessaires:
1. Le serveur modem-sim-server est-il démarré ? (npm run dev dans le dossier modem-sim-server)
2. Le tunnel Cloudflare est-il actif ?
   - Exécutez: cloudflared tunnel --config cloudflare-tunnel-config.yml run
3. Testez la connexion WebSocket manuellement:
   - Installez wscat: npm install -g wscat
   - Testez: wscat -c ${wsUrl}

URL configurée: ${wsUrl}`;
          
          setError(errorMsg);
          setConnectionStatus('error');
          setIsLoading(false);
        }
      };

    } catch (error) {
      console.error('Erreur lors de la création de la connexion WebSocket:', error);
      setError(`Échec de création de la connexion WebSocket: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setConnectionStatus('error');
      setIsLoading(false);
    }
  }, [handleWebSocketMessage, sendWebSocketMessage, wsUrl]);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Clear all pending requests
      pendingRequestsRef.current.forEach(({ reject, timeout }) => {
        clearTimeout(timeout);
        reject(new Error('Component unmounted'));
      });
      pendingRequestsRef.current.clear();

      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connectWebSocket]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setError(null);
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual reconnect');
    }
    
    setTimeout(() => connectWebSocket(), 100);
  }, [connectWebSocket]);

  // Refresh modems
  const refreshModems = useCallback(async () => {
    try {
      setError(null);
      const response = await sendWebSocketMessage('getModems');
      if (response?.modems) {
        const modemsData = response.modems.map((modem: any) => ({
          ...modem,
          lastActivity: new Date(modem.lastActivity)
        }));
        setModems(modemsData);
      }
    } catch (error) {
      console.error('Error refreshing modems:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh modems');
    }
  }, [sendWebSocketMessage]);

  // Test balance for a specific modem
  const testBalance = useCallback(async (portPath: string): Promise<USSDResponse> => {
    try {
      const response = await sendWebSocketMessage('testBalance', { port: portPath });
      
      const ussdResponse: USSDResponse = {
        success: response.response?.success ?? false,
        response: response.response?.response || '',
        error: response.response?.error,
        timestamp: new Date(),
        duration: response.response?.duration
      };

      return ussdResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        response: '',
        error: errorMessage,
        timestamp: new Date()
      };
    }
  }, [sendWebSocketMessage]);

  // Send transfer for a specific modem
  const sendTransfer = useCallback(async (
    portPath: string, 
    amount: number, 
    recipientPhone: string,
    transactionId?: string
  ): Promise<USSDResponse> => {
    try {
      const response = await sendWebSocketMessage('sendTransfer', {
        port: portPath,
        amount,
        recipientPhone,
        transactionId
      });
      
      const ussdResponse: USSDResponse = {
        success: response.response?.success ?? false,
        response: response.response?.response || '',
        error: response.response?.error,
        timestamp: new Date(),
        duration: response.response?.duration
      };

      // Si le transfert est réussi, créer une transaction dans la base de données
      if (ussdResponse.success && transactionId) {
        try {
          await supabase
            .from('transactions')
            .update({
              status: 'completed',
              ussd_response: ussdResponse.response,
              completed_at: new Date().toISOString()
            })
            .eq('id', transactionId);
        } catch (dbError) {
          console.error('Error updating transaction in database:', dbError);
        }
      }

      return ussdResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Mettre à jour la transaction comme échouée si un ID est fourni
      if (transactionId) {
        try {
          await supabase
            .from('transactions')
            .update({
              status: 'failed',
              error_message: errorMessage
            })
            .eq('id', transactionId);
        } catch (dbError) {
          console.error('Error updating failed transaction in database:', dbError);
        }
      }
      
      return {
        success: false,
        response: '',
        error: errorMessage,
        timestamp: new Date()
      };
    }
  }, [sendWebSocketMessage]);

  // Send custom USSD command
  const sendCustomUSSD = useCallback(async (
    portPath: string, 
    ussdCode: string
  ): Promise<USSDResponse> => {
    try {
      const response = await sendWebSocketMessage('sendUSSD', {
        port: portPath,
        ussdCode
      });
      
      const ussdResponse: USSDResponse = {
        success: response.response?.success ?? false,
        response: response.response?.response || '',
        error: response.response?.error,
        timestamp: new Date(),
        duration: response.response?.duration
      };

      return ussdResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        response: '',
        error: errorMessage,
        timestamp: new Date()
      };
    }
  }, [sendWebSocketMessage]);

  // Scan for modems
  const scanModems = useCallback(async () => {
    try {
      setError(null);
      await sendWebSocketMessage('scanModems');
    } catch (error) {
      console.error('Error scanning modems:', error);
      setError(error instanceof Error ? error.message : 'Failed to scan modems');
    }
  }, [sendWebSocketMessage]);

  return {
    modems,
    ussdLogs,
    isLoading,
    error,
    isConnected,
    connectionStatus,
    refreshModems,
    testBalance,
    sendTransfer,
    sendCustomUSSD,
    scanModems,
    reconnect,
    wsUrl // Exposer l'URL pour l'affichage dans l'UI
  };
}