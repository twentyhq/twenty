import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type CustomConnectionProviderConfig = {
  authorizeLogicFunction: SyncableEntityOptions;
  callbackLogicFunction: SyncableEntityOptions;
};
