// Resolved form of `CustomConnectionProviderConfig` as stored in the
// `connectionProvider.customConfig` JSONB column.
export type StoredCustomConnectionProviderConfig = {
  authorizeLogicFunctionUniversalIdentifier: string;
  callbackLogicFunctionUniversalIdentifier: string;
};
