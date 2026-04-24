export type RootStackParamList = {
  Tabs: undefined;
  Settings: undefined;
  LoteDetail: { loteId: string };
  AnimalHistorico: { animalId: string };
};

export type AuthStackParamList = {
  Welcome: undefined;
  EmailAuth: { mode: 'signIn' | 'signUp' };
};

export type TabsParamList = {
  Início: undefined;
  Pesar: { loteId?: string; codigo?: string } | undefined;
  Lotes: undefined;
  Relatórios: undefined;
};
