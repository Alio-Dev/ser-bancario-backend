import { supabase } from './supabase';

export interface ActivityLogData {
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  user_id?: string;
}

export async function logActivity(data: ActivityLogData) {
  try {
    const { error } = await (supabase as any).from('activity_logs').insert({
      action: data.action,
      table_name: data.table_name,
      record_id: data.record_id || null,
      old_values: data.old_values || null,
      new_values: data.new_values || null,
      user_id: data.user_id || null,
      ip_address: null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
