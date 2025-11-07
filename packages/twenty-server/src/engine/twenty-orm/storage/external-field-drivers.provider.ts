import { type Provider } from '@nestjs/common';

import { RedisStorageDriver } from 'src/engine/twenty-orm/storage/drivers/redis-storage.driver';
import {
  EXTERNAL_FIELD_DRIVERS,
  type ExternalFieldDrivers,
} from 'src/engine/twenty-orm/storage/external-field-drivers.token';

export const ExternalFieldDriversProvider: Provider<ExternalFieldDrivers> = {
  provide: EXTERNAL_FIELD_DRIVERS,
  useFactory: (redisDriver: RedisStorageDriver): ExternalFieldDrivers =>
    ({
      redis: redisDriver,
    }) as const,
  inject: [RedisStorageDriver],
};
