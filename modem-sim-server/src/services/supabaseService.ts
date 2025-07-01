import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { logger } from '../utils/logger';
import { SimData, OperatorData, TransactionData } from '../types';

class SupabaseService {
  private client;

  constructor() {
    this.client = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    );
  }

  // Gestion des SIMs
  async getSims(): Promise<SimData[]> {
    try {
      const { data, error } = await this.client
        .from('sims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching SIMs:', error);
      throw error;
    }
  }

  async updateSimStatus(simId: string, status: string, balance?: number): Promise<void> {
    try {
      const updateData: any = {
        status,
        last_used: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (balance !== undefined) {
        updateData.balance = balance;
      }

      const { error } = await this.client
        .from('sims')
        .update(updateData)
        .eq('id', simId);

      if (error) throw error;
      logger.info(`SIM ${simId} status updated to ${status}`);
    } catch (error) {
      logger.error(`Error updating SIM ${simId}:`, error);
      throw error;
    }
  }

  async associateSimWithModem(simId: string, modemPort: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('sims')
        .update({
          modem_port: modemPort,
          updated_at: new Date().toISOString(),
        })
        .eq('id', simId);

      if (error) throw error;
      logger.info(`SIM ${simId} associated with modem ${modemPort}`);
    } catch (error) {
      logger.error(`Error associating SIM ${simId} with modem ${modemPort}:`, error);
      throw error;
    }
  }

  // Gestion des opérateurs
  async getOperators(): Promise<OperatorData[]> {
    try {
      const { data, error } = await this.client
        .from('operators')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error fetching operators:', error);
      throw error;
    }
  }

  async getOperatorByCode(code: string): Promise<OperatorData | null> {
    try {
      const { data, error } = await this.client
        .from('operators')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error fetching operator ${code}:`, error);
      throw error;
    }
  }

  // Gestion des transactions
  async getTransaction(transactionId: string): Promise<TransactionData | null> {
    try {
      const { data, error } = await this.client
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      logger.error(`Error fetching transaction ${transactionId}:`, error);
      throw error;
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    status: string,
    ussdResponse?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (ussdResponse) {
        updateData.ussd_response = ussdResponse;
      }

      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      const { error } = await this.client
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) throw error;
      logger.info(`Transaction ${transactionId} status updated to ${status}`);
    } catch (error) {
      logger.error(`Error updating transaction ${transactionId}:`, error);
      throw error;
    }
  }

  async incrementTransactionRetry(transactionId: string): Promise<void> {
    try {
      const { error } = await this.client
        .rpc('increment_transaction_retry', { transaction_id: transactionId });

      if (error) throw error;
      logger.info(`Transaction ${transactionId} retry count incremented`);
    } catch (error) {
      logger.error(`Error incrementing retry for transaction ${transactionId}:`, error);
      throw error;
    }
  }

  // Gestion des logs USSD
  async logUSSDCommand(
    port: string,
    command: string,
    response: string,
    success: boolean,
    duration?: number
  ): Promise<void> {
    try {
      const { error } = await this.client
        .from('ussd_logs')
        .insert({
          port,
          command,
          response,
          success,
          duration,
          timestamp: new Date().toISOString(),
        });

      if (error) throw error;
      logger.debug(`USSD command logged for port ${port}`);
    } catch (error) {
      logger.error('Error logging USSD command:', error);
      // Ne pas propager l'erreur pour ne pas interrompre le flux principal
    }
  }
}

export const supabaseService = new SupabaseService();