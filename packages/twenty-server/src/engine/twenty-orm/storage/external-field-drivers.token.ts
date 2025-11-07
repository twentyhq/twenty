import { type InjectionToken } from '@nestjs/common';

import { type RedisStorageDriver } from 'src/engine/twenty-orm/storage/drivers/redis-storage.driver';

export type ExternalFieldDrivers = {
  redis: RedisStorageDriver;
};

export const EXTERNAL_FIELD_DRIVERS: InjectionToken = Symbol(
  'EXTERNAL_FIELD_DRIVERS',
);
