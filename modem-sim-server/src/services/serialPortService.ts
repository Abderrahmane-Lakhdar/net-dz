import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { logger } from '../utils/logger';
import { config } from '../config';
import { EventEmitter } from 'events';

export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  vendorId?: string;
  productId?: string;
}

export class SerialPortService extends EventEmitter {
  private ports: Map<string, SerialPort> = new Map();
  private parsers: Map<string, ReadlineParser> = new Map();
  private commandQueues: Map<string, Array<{
    command: string;
    resolve: (value: string) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>> = new Map();

  constructor() {
    super();
  }

  // Lister tous les ports série disponibles
  async listPorts(): Promise<SerialPortInfo[]> {
    try {
      const ports = await SerialPort.list();
      logger.info(`Found ${ports.length} serial ports`);
      return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        pnpId: port.pnpId,
        locationId: port.locationId,
        vendorId: port.vendorId,
        productId: port.productId,
      }));
    } catch (error) {
      logger.error('Error listing serial ports:', error);
      throw error;
    }
  }

  // Ouvrir une connexion vers un port série
  async openPort(portPath: string): Promise<void> {
    try {
      if (this.ports.has(portPath)) {
        logger.warn(`Port ${portPath} is already open`);
        return;
      }

      const port = new SerialPort({
        path: portPath,
        baudRate: config.modem.baudRate,
        dataBits: config.modem.dataBits,
        stopBits: config.modem.stopBits,
        parity: config.modem.parity,
        autoOpen: false,
      });

      const parser = new ReadlineParser({ delimiter: '\r\n' });
      port.pipe(parser);

      // Initialiser la queue de commandes pour ce port
      this.commandQueues.set(portPath, []);

      // Gestionnaires d'événements
      port.on('open', () => {
        logger.info(`Serial port ${portPath} opened successfully`);
        this.emit('portOpened', portPath);
      });

      port.on('error', (error) => {
        logger.error(`Serial port ${portPath} error:`, error);
        this.emit('portError', portPath, error);
        this.closePort(portPath);
      });

      port.on('close', () => {
        logger.info(`Serial port ${portPath} closed`);
        this.emit('portClosed', portPath);
        this.cleanup(portPath);
      });

      parser.on('data', (data: string) => {
        this.handleResponse(portPath, data.trim());
      });

      // Ouvrir le port
      await new Promise<void>((resolve, reject) => {
        port.open((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      this.ports.set(portPath, port);
      this.parsers.set(portPath, parser);

      logger.info(`Port ${portPath} opened and configured`);
    } catch (error) {
      logger.error(`Error opening port ${portPath}:`, error);
      throw error;
    }
  }

  // Fermer une connexion port série
  async closePort(portPath: string): Promise<void> {
    try {
      const port = this.ports.get(portPath);
      if (!port) {
        logger.warn(`Port ${portPath} is not open`);
        return;
      }

      if (port.isOpen) {
        await new Promise<void>((resolve) => {
          port.close(() => {
            resolve();
          });
        });
      }

      this.cleanup(portPath);
      logger.info(`Port ${portPath} closed successfully`);
    } catch (error) {
      logger.error(`Error closing port ${portPath}:`, error);
      throw error;
    }
  }

  // Nettoyer les ressources d'un port
  private cleanup(portPath: string): void {
    // Nettoyer la queue de commandes
    const queue = this.commandQueues.get(portPath);
    if (queue) {
      queue.forEach(({ reject, timeout }) => {
        clearTimeout(timeout);
        reject(new Error(`Port ${portPath} closed`));
      });
      this.commandQueues.delete(portPath);
    }

    this.ports.delete(portPath);
    this.parsers.delete(portPath);
  }

  // Envoyer une commande AT et attendre la réponse
  async sendCommand(portPath: string, command: string, timeout: number = config.modem.commandTimeout): Promise<string> {
    return new Promise((resolve, reject) => {
      const port = this.ports.get(portPath);
      if (!port || !port.isOpen) {
        reject(new Error(`Port ${portPath} is not open`));
        return;
      }

      const queue = this.commandQueues.get(portPath);
      if (!queue) {
        reject(new Error(`No command queue for port ${portPath}`));
        return;
      }

      const timeoutHandle = setTimeout(() => {
        const index = queue.findIndex(item => item.command === command);
        if (index !== -1) {
          queue.splice(index, 1);
        }
        reject(new Error(`Command timeout after ${timeout}ms: ${command}`));
      }, timeout);

      queue.push({
        command,
        resolve,
        reject,
        timeout: timeoutHandle,
      });

      // Si c'est la seule commande dans la queue, l'envoyer immédiatement
      if (queue.length === 1) {
        this.processNextCommand(portPath);
      }
    });
  }

  // Traiter la prochaine commande dans la queue
  private processNextCommand(portPath: string): void {
    const port = this.ports.get(portPath);
    const queue = this.commandQueues.get(portPath);

    if (!port || !queue || queue.length === 0) {
      return;
    }

    const { command } = queue[0];
    
    logger.debug(`Sending command to ${portPath}: ${command}`);
    port.write(command + '\r\n', (error) => {
      if (error) {
        const item = queue.shift();
        if (item) {
          clearTimeout(item.timeout);
          item.reject(error);
        }
        this.processNextCommand(portPath); // Traiter la commande suivante
      }
    });
  }

  // Gérer les réponses reçues
  private handleResponse(portPath: string, response: string): void {
    const queue = this.commandQueues.get(portPath);
    if (!queue || queue.length === 0) {
      logger.debug(`Unsolicited response from ${portPath}: ${response}`);
      return;
    }

    // Ignorer les lignes vides et les échos
    if (!response || response === queue[0].command) {
      return;
    }

    // Vérifier si c'est une réponse finale (OK, ERROR, ou réponse USSD)
    if (this.isFinalResponse(response)) {
      const item = queue.shift();
      if (item) {
        clearTimeout(item.timeout);
        item.resolve(response);
        
        // Traiter la commande suivante dans la queue
        this.processNextCommand(portPath);
      }
    }
  }

  // Vérifier si une réponse est finale
  private isFinalResponse(response: string): boolean {
    return response === 'OK' || 
           response === 'ERROR' || 
           response.startsWith('+CUSD:') ||
           response.startsWith('+CME ERROR:') ||
           response.startsWith('+CMS ERROR:');
  }

  // Envoyer une commande USSD
  async sendUSSD(portPath: string, ussdCode: string, timeout: number = 30000): Promise<string> {
    try {
      // Encoder le code USSD pour éviter les problèmes de caractères spéciaux
      const encodedUSSD = this.encodeUSSD(ussdCode);
      const command = `AT+CUSD=1,"${encodedUSSD}",15`;
      
      const response = await this.sendCommand(portPath, command, timeout);
      
      // Parser la réponse USSD
      if (response.startsWith('+CUSD:')) {
        const match = response.match(/\+CUSD:\s*\d+,"([^"]*)",\d+/);
        if (match) {
          return this.decodeUSSD(match[1]);
        }
      }
      
      if (response === 'OK') {
        throw new Error('USSD command sent but no response received');
      }
      
      throw new Error(`Unexpected USSD response: ${response}`);
    } catch (error) {
      logger.error(`Error sending USSD to ${portPath}:`, error);
      throw error;
    }
  }

  // Encoder le code USSD
  private encodeUSSD(ussdCode: string): string {
    // Pour l'instant, simple encodage. Peut être étendu pour supporter d'autres encodages
    return ussdCode;
  }

  // Décoder la réponse USSD
  private decodeUSSD(response: string): string {
    // Décoder les caractères échappés et autres encodages
    return response.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }

  // Fermer tous les ports
  async closeAllPorts(): Promise<void> {
    const closingPromises = Array.from(this.ports.keys()).map(portPath => 
      this.closePort(portPath)
    );
    
    await Promise.all(closingPromises);
    logger.info('All serial ports closed');
  }

  // Vérifier si un port est ouvert
  isPortOpen(portPath: string): boolean {
    const port = this.ports.get(portPath);
    return port ? port.isOpen : false;
  }

  // Obtenir la liste des ports ouverts
  getOpenPorts(): string[] {
    return Array.from(this.ports.keys()).filter(portPath => this.isPortOpen(portPath));
  }
}

export const serialPortService = new SerialPortService();