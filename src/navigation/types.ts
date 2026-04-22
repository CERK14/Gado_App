export type RootStackParamList = {
  Tabs: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  EmailAuth: { mode: 'signIn' | 'signUp' };
};

export type TabsParamList = {
  Início: undefined;
  Pesar: undefined;
  Lotes: undefined;
  Relatórios: undefined;
};
