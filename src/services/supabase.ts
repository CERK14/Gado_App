import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '../config/env';

export const supabase = createClient(
  env.supabaseUrl || 'http://placeholder.invalid',
  env.supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export function logSupabaseStatus() {
  if (isSupabaseConfigured) {
    console.log('[supabase] client criado com URL configurada');
  } else {
    console.warn('[supabase] chaves ausentes — preencha .env para habilitar a nuvem');
  }
}
