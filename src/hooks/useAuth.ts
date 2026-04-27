import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../services/supabase';
import { initRevenueCat, logoutRevenueCat } from '../services/revenuecat';
import { isSupabaseConfigured } from '../config/env';
import { useAppStore } from '../store/appStore';

WebBrowser.maybeCompleteAuthSession();

export type AuthState = {
  session: Session | null;
  loading: boolean;
  signingIn: boolean;
};

function extrairCode(url: string): string | null {
  const m = url.match(/[?&#]code=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: true,
    signingIn: false,
  });
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState((s) => ({ ...s, session: data.session, loading: false }));
      const u = data.session?.user
        ? { id: data.session.user.id, email: data.session.user.email ?? undefined }
        : null;
      setUser(u);
      if (u) initRevenueCat(u.id).catch(() => {});
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((s) => ({ ...s, session }));
      const u = session?.user
        ? { id: session.user.id, email: session.user.email ?? undefined }
        : null;
      setUser(u);
      if (u) {
        initRevenueCat(u.id).catch(() => {});
      } else {
        logoutRevenueCat().catch(() => {});
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setUser]);

  async function guardSupabase() {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado. Preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no .env.');
    }
  }

  async function signInWithEmail(email: string, password: string) {
    await guardSupabase();
    setState((s) => ({ ...s, signingIn: true }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setState((s) => ({ ...s, signingIn: false }));
    }
  }

  async function signUpWithEmail(email: string, password: string) {
    await guardSupabase();
    setState((s) => ({ ...s, signingIn: true }));
    try {
      const redirectTo = AuthSession.makeRedirectUri({ scheme: 'gadoapp' });
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
    } finally {
      setState((s) => ({ ...s, signingIn: false }));
    }
  }

  async function signInWithProviderViaSupabase(provider: 'google' | 'apple') {
    await guardSupabase();
    setState((s) => ({ ...s, signingIn: true }));
    try {
      const redirectTo = AuthSession.makeRedirectUri({ scheme: 'gadoapp' });
      console.log('[oauth] redirectTo=', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('Não foi possível iniciar o login.');

      console.log('[oauth] abrindo URL=', data.url);
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      console.log('[oauth] result.type=', result.type);
      if (result.type === 'success') {
        console.log('[oauth] result.url=', result.url);
      }

      if (result.type !== 'success') {
        throw new Error(`Login cancelado (tipo: ${result.type}).`);
      }

      const code = extrairCode(result.url);
      console.log('[oauth] code extraído=', code ? `${code.slice(0, 8)}…` : 'NÃO ENCONTRADO');
      if (!code) throw new Error('Resposta sem código de autorização.');

      const { data: sessData, error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
      if (codeErr) {
        console.log('[oauth] exchange ERRO:', codeErr.message);
        throw codeErr;
      }
      console.log('[oauth] sessão criada para', sessData.user?.email);
    } finally {
      setState((s) => ({ ...s, signingIn: false }));
    }
  }

  async function signInWithGoogle() {
    await signInWithProviderViaSupabase('google');
  }

  async function signInWithApple() {
    if (Platform.OS === 'ios') {
      await guardSupabase();
      setState((s) => ({ ...s, signingIn: true }));
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        if (!credential.identityToken) throw new Error('Token Apple ausente.');
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) throw error;
      } finally {
        setState((s) => ({ ...s, signingIn: false }));
      }
      return;
    }
    await signInWithProviderViaSupabase('apple');
  }

  async function signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setState((s) => ({ ...s, session: null }));
    setUser(null);
  }

  return {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    appleAvailable: Platform.OS === 'ios',
  };
}
