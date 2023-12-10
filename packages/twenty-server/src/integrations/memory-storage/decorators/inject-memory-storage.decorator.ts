import { Inject } from '@nestjs/common';

import { createMemoryStorageInjectionToken } from 'src/integrations/memory-storage/memory-storage.util';

export const InjectMemoryStorage = (identifier: string) => {
  const injectionToken = createMemoryStorageInjectionToken(identifier);

  return Inject(injectionToken);
};
