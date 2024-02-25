import { MEMORY_STORAGE_SERVICE } from 'src/integrations/memory-storage/constants/MemoryStorageService';

export const createMemoryStorageInjectionToken = (identifier: string) => {
  return `${MEMORY_STORAGE_SERVICE}_${identifier}`;
};
