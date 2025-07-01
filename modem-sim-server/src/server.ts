import http from 'http';
import { logger } from './utils/logger';
import { config } from './config';
import { modemManager } from './services/modemManager';
import { websocketService } from './services/websocketService';
import { supabaseService } from './services/supabaseService';

class SimManagerServer {
  private server: http.Server;
  private isShuttingDown = false;

  constructor() {
    this.server = http.createServer();
    this.setupEventHandlers();
  }

  // Configurer les gestionnaires d'événements
  private setupEventHandlers(): void {
    // Gestionnaires du serveur HTTP
    this.server.on('listening', () => {
      logger.info(`SIM Manager Server listening on port ${config.port}`);
    });

    this.server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Gestionnaires du ModemManager
    modemManager.on('initialized', (modems) => {
      logger.info(`ModemManager initialized with ${modems.length} modems`);
      websocketService.broadcastModemStatus(modems);
    });

    modemManager.on('modemConnected', (modem) => {
      logger.info(`Modem connected: ${modem.port}`);
      websocketService.broadcastModemStatus(modemManager.getModemList());
    });

    modemManager.on('modemDisconnected', (modem) => {
      logger.info(`Modem disconnected: ${modem.port}`);
      websocketService.broadcastModemStatus(modemManager.getModemList());
    });

    modemManager.on('modemUpdated', (modem) => {
      websocketService.broadcastModemStatus(modemManager.getModemList());
    });

    modemManager.on('ussdResponse', (port, response) => {
      websocketService.broadcastUSSDLog({
        port,
        response,
        timestamp: new Date(),
      });
    });

    // Gestionnaires WebSocket
    websocketService.on('message', async ({ clientId, ws, message }) => {
      await this.handleWebSocketMessage(clientId, ws, message);
    });

    // Gestionnaires de processus
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  }

  // Gérer les messages WebSocket
  private async handleWebSocketMessage(clientId: string, ws: any, message: any): Promise<void> {
    try {
      const { type, data, id } = message;

      switch (type) {
        case 'getModems':
          websocketService.sendResponse(ws, id, {
            modems: modemManager.getModemList(),
          });
          break;

        case 'testBalance':
          if (!data.port) {
            websocketService.sendError(ws, 'Port is required for balance test');
            return;
          }
          
          try {
            const response = await modemManager.testBalance(data.port);
            websocketService.sendResponse(ws, id, { response });
          } catch (error) {
            websocketService.sendError(ws, `Balance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'sendTransfer':
          if (!data.port || !data.amount || !data.recipientPhone) {
            websocketService.sendError(ws, 'Port, amount, and recipientPhone are required for transfer');
            return;
          }
          
          try {
            const response = await modemManager.sendTransfer(
              data.port,
              data.amount,
              data.recipientPhone,
              data.transactionId
            );
            websocketService.sendResponse(ws, id, { response });
          } catch (error) {
            websocketService.sendError(ws, `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'sendUSSD':
          if (!data.port || !data.ussdCode) {
            websocketService.sendError(ws, 'Port and ussdCode are required for USSD command');
            return;
          }
          
          try {
            const response = await modemManager.sendUSSDCommand(data.port, data.ussdCode);
            websocketService.sendResponse(ws, id, { response });
          } catch (error) {
            websocketService.sendError(ws, `USSD command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'scanModems':
          try {
            await modemManager.scanForModems();
            websocketService.sendResponse(ws, id, {
              message: 'Modem scan completed',
              modems: modemManager.getModemList(),
            });
          } catch (error) {
            websocketService.sendError(ws, `Modem scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        default:
          websocketService.sendError(ws, `Unknown message type: ${type}`);
      }
    } catch (error) {
      logger.error(`Error handling WebSocket message from ${clientId}:`, error);
      websocketService.sendError(ws, 'Internal server error');
    }
  }

  // Démarrer le serveur
  async start(): Promise<void> {
    try {
      logger.info('Starting SIM Manager Server...');

      // Initialiser les services
      await modemManager.initialize();
      websocketService.initialize(this.server);

      // Démarrer le serveur HTTP
      this.server.listen(config.port);

      logger.info('SIM Manager Server started successfully');
    } catch (error) {
      logger.error('Error starting server:', error);
      throw error;
    }
  }

  // Arrêt gracieux
  private async gracefulShutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    try {
      // Arrêter d'accepter de nouvelles connexions
      this.server.close(() => {
        logger.info('HTTP server closed');
      });

      // Arrêter les services
      await modemManager.shutdown();
      websocketService.shutdown();

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}

// Démarrer le serveur
const server = new SimManagerServer();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});