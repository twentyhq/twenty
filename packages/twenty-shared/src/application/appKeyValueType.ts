export type AppKeyValueScope = 'INSTALL' | 'GLOBAL';

export type AppKeyValue = {
  key: string;
  value: unknown;
  scope: AppKeyValueScope;
};
