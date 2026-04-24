import { create } from 'zustand';
import type { Unidade } from '../utils/peso';
import { configRepo } from '../db/repos';
import type { ConfigPatch } from '../db/repos/configRepo';

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
  setPlano: (plano: Plano) => void;
  setHydrated: (v: boolean) => void;
  hydrateFromDb: () => Promise<void>;
  atualizarConfig: (patch: ConfigPatch) => Promise<void>;
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
  setPlano: (plano) => set({ plano }),
  setHydrated: (hydrated) => set({ hydrated }),

  hydrateFromDb: async () => {
    const cfg = await configRepo.getConfig();
    set({
      unidade: cfg.unidade,
      metaGMD: cfg.meta_gmd,
      pesoAbate: cfg.peso_abate,
      precoKg: cfg.preco_kg,
      hydrated: true,
    });
  },

  atualizarConfig: async (patch) => {
    const cfg = await configRepo.updateConfig(patch);
    set({
      unidade: cfg.unidade,
      metaGMD: cfg.meta_gmd,
      pesoAbate: cfg.peso_abate,
      precoKg: cfg.preco_kg,
    });
  },
}));
