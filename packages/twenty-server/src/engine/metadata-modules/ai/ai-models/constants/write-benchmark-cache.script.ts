import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const WRITE_BENCHMARK_CACHE_SCRIPT: CacheScript = {
  name: 'write-benchmark-cache',
  source: `
    if redis.call('GET', KEYS[1]) ~= ARGV[1] then
      return 0
    end
    if tonumber(ARGV[3]) > 0 then
      redis.call('SET', KEYS[2], ARGV[2], 'PX', ARGV[3])
    else
      redis.call('SET', KEYS[2], ARGV[2])
    end
    return 1
  `,
};
