import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { env } from '../config/env';

let configured = false;

export async function initRevenueCat(userId?: string): Promise<void> {
  const apiKey = Platform.OS === 'ios' ? env.revenueCatIosKey : env.revenueCatAndroidKey;
  if (!apiKey) {
    console.warn('[revenuecat] chave ausente — pagamentos desabilitados nesta build');
    return;
  }
  if (configured) return;

  Purchases.configure({ apiKey, appUserID: userId });
  configured = true;
  console.log('[revenuecat] configurado');
}

export async function restorePurchases() {
  if (!configured) return null;
  return Purchases.restorePurchases();
}
