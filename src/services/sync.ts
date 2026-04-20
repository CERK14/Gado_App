import { getDatabase } from '../db/sqlite';
import { supabase } from './supabase';
import { isSupabaseConfigured } from '../config/env';

export async function pushLocalChanges(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const db = await getDatabase();
  void db;
  void supabase;
}

export async function pullRemoteChanges(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const db = await getDatabase();
  void db;
  void supabase;
}

export async function syncAll(): Promise<void> {
  await pushLocalChanges();
  await pullRemoteChanges();
}
