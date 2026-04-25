import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { env } from '../config/env';
import { useAppStore } from '../store/appStore';

const ENTITLEMENT_PRO = 'pro';

let configured = false;

function customerInfoToPlano(info: CustomerInfo): 'pro' | 'free' {
  return info.entitlements.active[ENTITLEMENT_PRO] ? 'pro' : 'free';
}

export function isRevenueCatConfigured(): boolean {
  return configured;
}

export async function initRevenueCat(userId?: string): Promise<void> {
  const apiKey = Platform.OS === 'ios' ? env.revenueCatIosKey : env.revenueCatAndroidKey;
  if (!apiKey) {
    console.warn('[revenuecat] chave ausente — pagamentos desabilitados nesta build');
    return;
  }

  if (!configured) {
    Purchases.configure({ apiKey, appUserID: userId });
    Purchases.addCustomerInfoUpdateListener((info) => {
      useAppStore.getState().setPlano(customerInfoToPlano(info));
    });
    configured = true;
    console.log('[revenuecat] configurado');
  } else if (userId) {
    await Purchases.logIn(userId);
  }

  try {
    const info = await Purchases.getCustomerInfo();
    useAppStore.getState().setPlano(customerInfoToPlano(info));
  } catch (e) {
    console.warn('[revenuecat] não foi possível obter customerInfo', e);
  }
}

export async function logoutRevenueCat(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch {
    // ignore
  }
  useAppStore.getState().setPlano('free');
}

export async function carregarOfertas(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function comprarPacote(pacote: PurchasesPackage): Promise<'comprado' | 'cancelado'> {
  if (!configured) throw new Error('Pagamentos indisponíveis nesta build.');
  try {
    const { customerInfo } = await Purchases.purchasePackage(pacote);
    useAppStore.getState().setPlano(customerInfoToPlano(customerInfo));
    return 'comprado';
  } catch (e) {
    const userCancelled = (e as { userCancelled?: boolean })?.userCancelled;
    if (userCancelled) return 'cancelado';
    throw e;
  }
}

export async function restorePurchases(): Promise<'restaurado' | 'sem-compras' | null> {
  if (!configured) return null;
  const info = await Purchases.restorePurchases();
  const plano = customerInfoToPlano(info);
  useAppStore.getState().setPlano(plano);
  return plano === 'pro' ? 'restaurado' : 'sem-compras';
}
