import type { Unidade } from '../utils/peso';

export type ConfigRow = {
  id: 1;
  meta_gmd: number;
  peso_abate: number;
  preco_kg: number;
  unidade: Unidade;
  updated_at: string;
};

export type LoteRow = {
  id: string;
  nome: string;
  cor: string;
  peso_abate: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string | null;
};

export type AnimalRow = {
  id: string;
  lote_id: string;
  codigo: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string | null;
};

export type PesagemRow = {
  id: string;
  animal_id: string;
  peso_kg: number;
  peso_arroba: number;
  data: string;
  created_at: string;
  synced_at: string | null;
};

export type AnimalComUltimoPeso = AnimalRow & {
  ultimo_peso_kg: number | null;
  ultimo_peso_arroba: number | null;
  ultima_pesagem: string | null;
  total_pesagens: number;
};
