import { MEMORY_STORAGE_SERVICE } from 'src/integrations/memory-storage/memory-storage.constants';

export const createMemoryStorageInjectionToken = (identifier: string) => {
  return `${MEMORY_STORAGE_SERVICE}_${identifier}`;
};
