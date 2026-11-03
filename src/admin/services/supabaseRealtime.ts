import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storeService } from './storeService';

let activeRealtimeChannel: RealtimeChannel | null = null;

/**
 * Initializes Supabase Realtime subscriptions to listen for PostgreSQL
 * row changes across all store entities and triggers seamless store synchronization.
 */
export function initSupabaseRealtime(): () => void {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }

  // Teardown existing channel if any
  if (activeRealtimeChannel) {
    try {
      supabase.removeChannel(activeRealtimeChannel);
    } catch {
      // ignore
    }
    activeRealtimeChannel = null;
  }

  try {
    const channel = supabase
      .channel('funkyfox-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        storeService.syncFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        storeService.syncFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        storeService.syncFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        storeService.syncFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_logs' }, () => {
        storeService.syncFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => {
        storeService.syncFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
        storeService.syncFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => {
        storeService.syncFromSupabase();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.info('[Realtime] Live database sync active');
        }
      });

    activeRealtimeChannel = channel;

    return () => {
      if (activeRealtimeChannel && supabase) {
        supabase.removeChannel(activeRealtimeChannel);
        activeRealtimeChannel = null;
      }
    };
  } catch (err) {
    console.warn('[Realtime] Failed to initialize Supabase listener:', err);
    return () => {};
  }
}
