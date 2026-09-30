import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const PUBLISH_WORKSPACE_CACHE_SCRIPT: CacheScript = {
  name: 'workspace-cache:publish',
  source: `
local ttl = tonumber(ARGV[1])
local published = {}
for index = 1, #KEYS, 2 do
  local hash = ARGV[index + 1]
  local data = ARGV[index + 2]
  if redis.call('GET', KEYS[index]) == hash then
    if data ~= '' then
      if ttl > 0 then
        redis.call('SET', KEYS[index + 1], data, 'PX', ttl)
      else
        redis.call('SET', KEYS[index + 1], data)
      end
    end
    if ttl > 0 then
      redis.call('PEXPIRE', KEYS[index], ttl)
    end
    table.insert(published, 1)
  else
    table.insert(published, 0)
  end
end
return published
`,
};
