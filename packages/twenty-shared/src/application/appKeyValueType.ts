import { type AppKeyValueScope } from '@/application/appKeyValueScopeType';

export type AppKeyValue = {
  key: string;
  value: unknown;
  scope: AppKeyValueScope;
};
