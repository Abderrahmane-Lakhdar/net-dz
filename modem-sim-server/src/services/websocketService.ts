import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { config } from '../config';
import { WebSocketMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class WebSocketService extends EventEmitter {
  private wss: WebSocket.Server | null = null;
  private clients: Set<WebSocket> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  // Initialiser le serveur WebSocket
  initialize(server: any): void {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws: WebSocket, request) => {
      this.handleConnection(ws, request);
    });
    
    this.startHeartbeat();
    logger.info('WebSocket service initialized');
  }

  // Gérer une nouvelle connexion
  private handleConnection(ws: WebSocket, request: any): void {
    const clientId = uuidv4();
    const clientIP = request.socket.remoteAddress;
    
    logger.info(`New WebSocket connection from ${clientIP} (ID: ${clientId})`);
    
    this.clients.add(ws);
    
    // Envoyer un message de bienvenue
    this.sendToClient(ws, {
      type: 'status',
      data: {
        message: 'Connected to CreditPro SIM Manager',
        clientId,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    });
    
    // Gestionnaires d'événements
    ws.on('message', (data: WebSocket.Data) => {
      this.handleMessage(ws, data, clientId);
    });
    
    ws.on('close', (code: number, reason: Buffer) => {
      this.handleDisconnection(ws, clientId, code, reason.toString());
    });
    
    ws.on('error', (error: Error) => {
      logger.error(`WebSocket error for client ${clientId}:`, error);
    });
    
    ws.on('pong', () => {
      // Client répond au ping, connexion active
      (ws as any).isAlive = true;
    });
    
    // Marquer la connexion comme active
    (ws as any).isAlive = true;
    (ws as any).clientId = clientId;
  }

  // Gérer un message reçu
  private handleMessage(ws: WebSocket, data: WebSocket.Data, clientId: string): void {
    try {
      const message = JSON.parse(data.toString());
      logger.debug(`Message received from ${clientId}:`, message);
      
      // Émettre l'événement pour que d'autres services puissent traiter le message
      this.emit('message', {
        clientId,
        ws,
        message,
      });
      
    } catch (error) {
      logger.error(`Error parsing message from ${clientId}:`, error);
      this.sendError(ws, 'Invalid JSON message');
    }
  }

  // Gérer une déconnexion
  private handleDisconnection(ws: WebSocket, clientId: string, code: number, reason: string): void {
    logger.info(`Client ${clientId} disconnected (code: ${code}, reason: ${reason})`);
    this.clients.delete(ws);
  }

  // Envoyer un message à un client spécifique
  sendToClient(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        logger.error('Error sending message to client:', error);
      }
    }
  }

  // Diffuser un message à tous les clients connectés
  broadcast(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
        } catch (error) {
          logger.error('Error broadcasting message:', error);
        }
      }
    });
  }

  // Envoyer une erreur à un client
  sendError(ws: WebSocket, errorMessage: string): void {
    this.sendToClient(ws, {
      type: 'error',
      data: {
        error: errorMessage,
      },
      timestamp: new Date(),
    });
  }

  // Envoyer une réponse à un client
  sendResponse(ws: WebSocket, requestId: string, data: any): void {
    this.sendToClient(ws, {
      type: 'response',
      data,
      timestamp: new Date(),
      id: requestId,
    });
  }

  // Diffuser le statut des modems
  broadcastModemStatus(modems: any[]): void {
    this.broadcast({
      type: 'status',
      data: {
        type: 'modems',
        modems,
      },
      timestamp: new Date(),
    });
  }

  // Diffuser un log USSD
  broadcastUSSDLog(log: any): void {
    this.broadcast({
      type: 'log',
      data: {
        type: 'ussd',
        log,
      },
      timestamp: new Date(),
    });
  }

  // Démarrer le heartbeat
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((ws) => {
        if ((ws as any).isAlive === false) {
          logger.info(`Terminating inactive client ${(ws as any).clientId}`);
          ws.terminate();
          this.clients.delete(ws);
          return;
        }
        
        (ws as any).isAlive = false;
        ws.ping();
      });
    }, config.websocket.heartbeatInterval);
  }

  // Arrêter le service
  shutdown(): void {
    logger.info('Shutting down WebSocket service...');
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Fermer toutes les connexions
    this.clients.forEach((ws) => {
      ws.close(1001, 'Server shutting down');
    });
    
    if (this.wss) {
      this.wss.close();
    }
    
    logger.info('WebSocket service shut down');
  }

  // Obtenir le nombre de clients connectés
  getClientCount(): number {
    return this.clients.size;
  }
}

export const websocketService = new WebSocketService();