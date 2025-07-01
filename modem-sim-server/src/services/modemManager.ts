import { EventEmitter } from 'events';
import { serialPortService, SerialPortInfo } from './serialPortService';
import { supabaseService } from './supabaseService';
import { logger } from '../utils/logger';
import { config } from '../config';
import { ModemInfo, USSDResponse, USSDCommand } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ModemManager extends EventEmitter {
  private modems: Map<string, ModemInfo> = new Map();
  private scanInterval: NodeJS.Timeout | null = null;
  private commandQueue: USSDCommand[] = [];
  private processingCommands: Set<string> = new Set();

  constructor() {
    super();
    this.setupEventListeners();
  }

  // Configurer les écouteurs d'événements
  private setupEventListeners(): void {
    serialPortService.on('portOpened', (portPath: string) => {
      this.onPortOpened(portPath);
    });

    serialPortService.on('portClosed', (portPath: string) => {
      this.onPortClosed(portPath);
    });

    serialPortService.on('portError', (portPath: string, error: Error) => {
      this.onPortError(portPath, error);
    });
  }

  // Initialiser le gestionnaire de modems
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Modem Manager...');
      
      // Wrap modem scanning in its own try-catch to prevent initialization failure
      try {
        await this.scanForModems();
      } catch (error) {
        logger.warn('Error during initial modem scan (continuing with initialization):', error);
        // Continue with initialization even if modem scanning fails
      }
      
      // Démarrer la surveillance périodique
      this.startPeriodicScan();
      
      logger.info('Modem Manager initialized successfully');
      this.emit('initialized', this.getModemList());
    } catch (error) {
      logger.error('Error initializing Modem Manager:', error);
      throw error;
    }
  }

  // Scanner les modems disponibles
  async scanForModems(): Promise<void> {
    try {
      logger.info('Scanning for modems...');
      
      const ports = await serialPortService.listPorts();
      const modemPorts = this.filterModemPorts(ports);
      
      logger.info(`Found ${modemPorts.length} potential modem ports`);
      
      // Tenter de se connecter à chaque port potentiel
      for (const port of modemPorts) {
        try {
          await this.connectToModem(port.path);
        } catch (error) {
          logger.warn(`Failed to connect to ${port.path}:`, error);
        }
      }
      
      this.emit('scanCompleted', this.getModemList());
    } catch (error) {
      logger.error('Error scanning for modems:', error);
      throw error;
    }
  }

  // Filtrer les ports qui pourraient être des modems
  private filterModemPorts(ports: SerialPortInfo[]): SerialPortInfo[] {
    return ports.filter(port => {
      // Filtrer par fabricant connu ou par nom de périphérique
      const knownManufacturers = [
        'Huawei',
        'ZTE',
        'Qualcomm',
        'Sierra Wireless',
        'Telit',
        'u-blox'
      ];
      
      if (port.manufacturer) {
        return knownManufacturers.some(manufacturer => 
          port.manufacturer!.toLowerCase().includes(manufacturer.toLowerCase())
        );
      }
      
      // Filtrer par nom de port (Linux/Windows)
      if (port.path.includes('ttyUSB') || port.path.includes('COM')) {
        return true;
      }
      
      return false;
    });
  }

  // Se connecter à un modem
  async connectToModem(portPath: string): Promise<void> {
    try {
      logger.info(`Connecting to modem at ${portPath}...`);
      
      await serialPortService.openPort(portPath);
      
      // Initialiser les informations du modem
      const modemInfo: ModemInfo = {
        port: portPath,
        isConnected: false,
        operator: null,
        signalStrength: 0,
        simStatus: 'absent',
        imsi: null,
        iccid: null,
        lastActivity: new Date(),
      };
      
      this.modems.set(portPath, modemInfo);
      
      // Tester la communication avec le modem
      await this.initializeModem(portPath);
      
    } catch (error) {
      logger.error(`Error connecting to modem ${portPath}:`, error);
      throw error;
    }
  }

  // Initialiser un modem après connexion
  private async initializeModem(portPath: string): Promise<void> {
    try {
      // Test de communication basique
      await serialPortService.sendCommand(portPath, 'AT');
      
      const modemInfo = this.modems.get(portPath);
      if (!modemInfo) return;
      
      modemInfo.isConnected = true;
      modemInfo.lastActivity = new Date();
      
      // Obtenir les informations du modem
      await this.updateModemInfo(portPath);
      
      logger.info(`Modem ${portPath} initialized successfully`);
      this.emit('modemConnected', modemInfo);
      
    } catch (error) {
      logger.error(`Error initializing modem ${portPath}:`, error);
      
      const modemInfo = this.modems.get(portPath);
      if (modemInfo) {
        modemInfo.error = error instanceof Error ? error.message : 'Unknown error';
        this.emit('modemError', modemInfo);
      }
    }
  }

  // Mettre à jour les informations d'un modem
  async updateModemInfo(portPath: string): Promise<void> {
    const modemInfo = this.modems.get(portPath);
    if (!modemInfo || !modemInfo.isConnected) return;
    
    try {
      // Force du signal
      try {
        const csqResponse = await serialPortService.sendCommand(portPath, 'AT+CSQ');
        const signalMatch = csqResponse.match(/\+CSQ:\s*(\d+),\d+/);
        if (signalMatch) {
          const rssi = parseInt(signalMatch[1], 10);
          modemInfo.signalStrength = rssi !== 99 ? Math.round((rssi / 31) * 100) : 0;
        }
      } catch (error) {
        logger.debug(`Error getting signal strength for ${portPath}:`, error);
      }
      
      // Opérateur
      try {
        const copsResponse = await serialPortService.sendCommand(portPath, 'AT+COPS?');
        const operatorMatch = copsResponse.match(/\+COPS:\s*\d+,\d+,"([^"]+)"/);
        if (operatorMatch) {
          modemInfo.operator = operatorMatch[1];
        }
      } catch (error) {
        logger.debug(`Error getting operator for ${portPath}:`, error);
      }
      
      // Statut SIM
      try {
        const cpinResponse = await serialPortService.sendCommand(portPath, 'AT+CPIN?');
        if (cpinResponse.includes('READY')) {
          modemInfo.simStatus = 'present';
          
          // IMSI
          try {
            const imsiResponse = await serialPortService.sendCommand(portPath, 'AT+CIMI');
            if (imsiResponse && imsiResponse !== 'OK' && imsiResponse !== 'ERROR') {
              modemInfo.imsi = imsiResponse.trim();
            }
          } catch (error) {
            logger.debug(`Error getting IMSI for ${portPath}:`, error);
          }
          
          // ICCID
          try {
            const iccidResponse = await serialPortService.sendCommand(portPath, 'AT+CCID');
            const iccidMatch = iccidResponse.match(/\+CCID:\s*(\d+)/);
            if (iccidMatch) {
              modemInfo.iccid = iccidMatch[1];
            }
          } catch (error) {
            logger.debug(`Error getting ICCID for ${portPath}:`, error);
          }
          
        } else {
          modemInfo.simStatus = 'absent';
        }
      } catch (error) {
        logger.debug(`Error checking SIM status for ${portPath}:`, error);
        modemInfo.simStatus = 'error';
      }
      
      modemInfo.lastActivity = new Date();
      modemInfo.error = undefined;
      
      this.emit('modemUpdated', modemInfo);
      
    } catch (error) {
      logger.error(`Error updating modem info for ${portPath}:`, error);
      modemInfo.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // Envoyer une commande USSD
  async sendUSSDCommand(portPath: string, ussdCode: string, transactionId?: string): Promise<USSDResponse> {
    const startTime = Date.now();
    
    try {
      const modemInfo = this.modems.get(portPath);
      if (!modemInfo || !modemInfo.isConnected || modemInfo.simStatus !== 'present') {
        throw new Error(`Modem ${portPath} not available or SIM not present`);
      }
      
      logger.info(`Sending USSD command ${ussdCode} to ${portPath}`);
      
      const response = await serialPortService.sendUSSD(portPath, ussdCode);
      const duration = Date.now() - startTime;
      
      const ussdResponse: USSDResponse = {
        success: true,
        response,
        timestamp: new Date(),
        duration,
      };
      
      // Mettre à jour l'activité du modem
      modemInfo.lastActivity = new Date();
      
      // Logger dans Supabase
      await supabaseService.logUSSDCommand(portPath, ussdCode, response, true, duration);
      
      // Mettre à jour la transaction si fournie
      if (transactionId) {
        await supabaseService.updateTransactionStatus(transactionId, 'completed', response);
      }
      
      logger.info(`USSD command completed successfully for ${portPath}`);
      this.emit('ussdResponse', portPath, ussdResponse);
      
      return ussdResponse;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const ussdResponse: USSDResponse = {
        success: false,
        response: '',
        error: errorMessage,
        timestamp: new Date(),
        duration,
      };
      
      // Logger dans Supabase
      await supabaseService.logUSSDCommand(portPath, ussdCode, errorMessage, false, duration);
      
      // Mettre à jour la transaction si fournie
      if (transactionId) {
        await supabaseService.updateTransactionStatus(transactionId, 'failed', undefined, errorMessage);
      }
      
      logger.error(`USSD command failed for ${portPath}:`, error);
      this.emit('ussdError', portPath, ussdResponse);
      
      return ussdResponse;
    }
  }

  // Tester le solde d'un modem
  async testBalance(portPath: string): Promise<USSDResponse> {
    const modemInfo = this.modems.get(portPath);
    if (!modemInfo || !modemInfo.operator) {
      throw new Error(`Modem ${portPath} not available or operator unknown`);
    }
    
    // Obtenir la configuration de l'opérateur
    const operator = await supabaseService.getOperatorByCode(this.getOperatorCode(modemInfo.operator));
    if (!operator) {
      throw new Error(`Operator configuration not found for ${modemInfo.operator}`);
    }
    
    const balanceCode = operator.ussd_config.balance_check;
    return this.sendUSSDCommand(portPath, balanceCode);
  }

  // Envoyer un transfert
  async sendTransfer(portPath: string, amount: number, recipientPhone: string, transactionId?: string): Promise<USSDResponse> {
    const modemInfo = this.modems.get(portPath);
    if (!modemInfo || !modemInfo.operator) {
      throw new Error(`Modem ${portPath} not available or operator unknown`);
    }
    
    // Obtenir la configuration de l'opérateur
    const operator = await supabaseService.getOperatorByCode(this.getOperatorCode(modemInfo.operator));
    if (!operator) {
      throw new Error(`Operator configuration not found for ${modemInfo.operator}`);
    }
    
    // Formater le numéro de téléphone
    const formattedPhone = this.formatPhoneNumber(recipientPhone);
    
    // Construire le code USSD de transfert
    const transferCode = operator.ussd_config.transfer_code
      .replace('{amount}', amount.toString())
      .replace('{phone}', formattedPhone);
    
    // Mettre à jour le statut de la transaction
    if (transactionId) {
      await supabaseService.updateTransactionStatus(transactionId, 'processing');
    }
    
    return this.sendUSSDCommand(portPath, transferCode, transactionId);
  }

  // Formater un numéro de téléphone
  private formatPhoneNumber(phone: string): string {
    // Supprimer le +213 ou 0 au début
    if (phone.startsWith('+213')) {
      return phone.substring(4);
    } else if (phone.startsWith('0')) {
      return phone.substring(1);
    }
    return phone;
  }

  // Obtenir le code opérateur
  private getOperatorCode(operatorName: string): string {
    const operatorMap: { [key: string]: string } = {
      'Djezzy': 'DJZ',
      'Mobilis': 'MOB',
      'Ooredoo': 'OOR',
    };
    
    for (const [name, code] of Object.entries(operatorMap)) {
      if (operatorName.toLowerCase().includes(name.toLowerCase())) {
        return code;
      }
    }
    
    return 'UNKNOWN';
  }

  // Démarrer la surveillance périodique
  private startPeriodicScan(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    
    this.scanInterval = setInterval(async () => {
      try {
        // Mettre à jour les informations des modems connectés
        for (const portPath of this.modems.keys()) {
          await this.updateModemInfo(portPath);
        }
        
        // Scanner pour de nouveaux modems (with error handling)
        try {
          await this.scanForModems();
        } catch (error) {
          logger.warn('Error during periodic modem scan:', error);
          // Continue with the periodic scan even if this iteration fails
        }
      } catch (error) {
        logger.error('Error during periodic scan:', error);
      }
    }, config.modem.scanInterval);
  }

  // Gestionnaires d'événements de port série
  private onPortOpened(portPath: string): void {
    logger.info(`Port ${portPath} opened`);
  }

  private onPortClosed(portPath: string): void {
    const modemInfo = this.modems.get(portPath);
    if (modemInfo) {
      modemInfo.isConnected = false;
      modemInfo.error = 'Port closed';
      this.emit('modemDisconnected', modemInfo);
    }
    logger.info(`Port ${portPath} closed`);
  }

  private onPortError(portPath: string, error: Error): void {
    const modemInfo = this.modems.get(portPath);
    if (modemInfo) {
      modemInfo.isConnected = false;
      modemInfo.error = error.message;
      this.emit('modemError', modemInfo);
    }
    logger.error(`Port ${portPath} error:`, error);
  }

  // Méthodes publiques
  getModemList(): ModemInfo[] {
    return Array.from(this.modems.values());
  }

  getModemByPort(portPath: string): ModemInfo | null {
    return this.modems.get(portPath) || null;
  }

  async disconnectModem(portPath: string): Promise<void> {
    await serialPortService.closePort(portPath);
    this.modems.delete(portPath);
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down Modem Manager...');
    
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    
    await serialPortService.closeAllPorts();
    this.modems.clear();
    
    logger.info('Modem Manager shut down successfully');
  }
}

export const modemManager = new ModemManager();