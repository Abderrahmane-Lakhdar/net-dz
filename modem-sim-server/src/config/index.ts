import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/sim-manager.log',
  },
  
  // Modem Configuration
  modem: {
    scanInterval: parseInt(process.env.MODEM_SCAN_INTERVAL || '30000', 10),
    commandTimeout: parseInt(process.env.MODEM_COMMAND_TIMEOUT || '10000', 10),
    retryAttempts: parseInt(process.env.MODEM_RETRY_ATTEMPTS || '3', 10),
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none' as const,
  },
  
  // WebSocket
  websocket: {
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10),
  },
};

// Validation
if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided');
}