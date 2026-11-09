import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const PUBLISH_WORKSPACE_CACHE_SCRIPT: CacheScript = {
  name: 'workspace-cache:publish',
  source: `
local function set(key, value, ttl)
  if ttl > 0 then
    redis.call('SET', key, value, 'PX', ttl)
  else
    redis.call('SET', key, value)
  end
end
local published = {}
local argumentIndex = 1
for index = 1, #KEYS, 2 do
  local ttl = tonumber(ARGV[argumentIndex])
  local expectedHash = ARGV[argumentIndex + 1]
  local hashToPublish = ARGV[argumentIndex + 2]
  local data = ARGV[argumentIndex + 3]
  local currentHash = redis.call('GET', KEYS[index]) or ''
  if currentHash == expectedHash then
    set(KEYS[index], hashToPublish, ttl)
    if data ~= '' then
      set(KEYS[index + 1], data, ttl)
    end
    table.insert(published, 1)
  else
    table.insert(published, 0)
  end
  argumentIndex = argumentIndex + 4
end
return published
`,
};
