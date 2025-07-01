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

export interface USSDCommand {
  id: string;
  port: string;
  command: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  response?: USSDResponse;
  retryCount: number;
}

export interface WebSocketMessage {
  type: 'command' | 'response' | 'status' | 'log' | 'error';
  data: any;
  timestamp: Date;
  id?: string;
}

export interface SimData {
  id: string;
  operator_id: string;
  phone_number: string;
  status: 'active' | 'inactive' | 'maintenance';
  balance: number;
  last_used: string | null;
  modem_port: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperatorData {
  id: string;
  name: string;
  code: string;
  ussd_config: {
    transfer_code: string;
    balance_check: string;
    timeout: number;
    retry_attempts: number;
    success_patterns: string[];
    error_patterns: string[];
  };
  is_active: boolean;
}

export interface TransactionData {
  id: string;
  client_id: string;
  operator_id: string;
  sim_id: string | null;
  distributor_id: string;
  amount: number;
  commission: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  recipient_phone: string;
  ussd_response: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}