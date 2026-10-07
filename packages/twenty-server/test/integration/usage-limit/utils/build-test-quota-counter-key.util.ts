import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

// Cache storage prefixes every key with the integration-tests namespace under NODE_ENV=test
export const buildTestQuotaCounterKey = (counterKey: string): string =>
  `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineUsageLimit}:${counterKey}`;
