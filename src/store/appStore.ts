import { create } from 'zustand';
import type { Unidade } from '../utils/peso';

export type Plano = 'free' | 'pro';

type User = {
  id: string;
  email?: string;
} | null;

type AppState = {
  user: User;
  unidade: Unidade;
  metaGMD: number;
  pesoAbate: number;
  precoKg: number;
  plano: Plano;
  hydrated: boolean;

  setUser: (user: User) => void;
  setUnidade: (unidade: Unidade) => void;
  setMetaGMD: (valor: number) => void;
  setPesoAbate: (valor: number) => void;
  setPrecoKg: (valor: number) => void;
  setPlano: (plano: Plano) => void;
  setHydrated: (v: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  user: null,
  unidade: 'kg',
  metaGMD: 1.2,
  pesoAbate: 540,
  precoKg: 12,
  plano: 'free',
  hydrated: false,

  setUser: (user) => set({ user }),
  setUnidade: (unidade) => set({ unidade }),
  setMetaGMD: (metaGMD) => set({ metaGMD }),
  setPesoAbate: (pesoAbate) => set({ pesoAbate }),
  setPrecoKg: (precoKg) => set({ precoKg }),
  setPlano: (plano) => set({ plano }),
  setHydrated: (hydrated) => set({ hydrated }),
}));
