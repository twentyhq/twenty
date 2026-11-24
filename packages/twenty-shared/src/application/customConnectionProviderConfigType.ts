import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type CustomConnectionProviderConfig = {
  authorizeLogicFunctionUniversalIdentifier?: string;
  callbackLogicFunctionUniversalIdentifier?: string;
  /** @deprecated Use `authorizeLogicFunctionUniversalIdentifier` instead. */
  authorizeLogicFunction?: SyncableEntityOptions;
  /** @deprecated Use `callbackLogicFunctionUniversalIdentifier` instead. */
  callbackLogicFunction?: SyncableEntityOptions;
};
