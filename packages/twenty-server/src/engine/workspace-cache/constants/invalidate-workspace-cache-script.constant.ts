import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const INVALIDATE_WORKSPACE_CACHE_SCRIPT: CacheScript = {
  name: 'workspace-cache:invalidate',
  source: `
local ttl = tonumber(ARGV[1])
for index = 1, #KEYS, 2 do
  local hash = ARGV[(index + 1) / 2 + 1]
  if ttl > 0 then
    redis.call('SET', KEYS[index], hash, 'PX', ttl)
  else
    redis.call('SET', KEYS[index], hash)
  end
  redis.call('DEL', KEYS[index + 1])
end
return 1
`,
};
