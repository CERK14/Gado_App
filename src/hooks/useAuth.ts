import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../services/supabase';
import { initRevenueCat, logoutRevenueCat } from '../services/revenuecat';
import { env, isGoogleConfigured, isSupabaseConfigured } from '../config/env';
import { useAppStore } from '../store/appStore';

WebBrowser.maybeCompleteAuthSession();

export type AuthState = {
  session: Session | null;
  loading: boolean;
  signingIn: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: true,
    signingIn: false,
  });
  const setUser = useAppStore((s) => s.setUser);

  const [, , promptGoogle] = Google.useIdTokenAuthRequest({
    webClientId: env.googleWebClientId || undefined,
    iosClientId: env.googleIosClientId || env.googleWebClientId || undefined,
    androidClientId: env.googleAndroidClientId || env.googleWebClientId || undefined,
  });

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

  async function signInWithGoogle() {
    await guardSupabase();
    if (!isGoogleConfigured) {
      throw new Error('Google Sign-In não configurado. Preencha EXPO_PUBLIC_GOOGLE_*_CLIENT_ID no .env.');
    }
    setState((s) => ({ ...s, signingIn: true }));
    try {
      const result = await promptGoogle();
      if (result?.type !== 'success') {
        throw new Error('Login com Google cancelado.');
      }
      const idToken = result.params?.id_token;
      if (!idToken) throw new Error('Token Google ausente.');
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      if (error) throw error;
    } finally {
      setState((s) => ({ ...s, signingIn: false }));
    }
  }

  async function signInWithApple() {
    await guardSupabase();
    if (Platform.OS !== 'ios') {
      throw new Error('Entrar com Apple só está disponível em iPhone.');
    }
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
