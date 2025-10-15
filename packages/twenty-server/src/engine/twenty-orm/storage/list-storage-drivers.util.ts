import { RedisStorageDriver } from 'src/engine/twenty-orm/storage/drivers/redis-storage.driver';

export const listStorageDrivers = (redisStorageDriver: RedisStorageDriver) => {
  return {
    redis: redisStorageDriver,
  } as const;
};
