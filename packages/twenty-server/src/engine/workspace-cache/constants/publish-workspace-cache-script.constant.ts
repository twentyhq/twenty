import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

// ARGV: ttl, then per key: hash read before loading rows ('' if absent), hash to publish, data ('' for local-only keys)
export const PUBLISH_WORKSPACE_CACHE_SCRIPT: CacheScript = {
  name: 'workspace-cache:publish',
  source: `
local ttl = tonumber(ARGV[1])
local function set(key, value)
  if ttl > 0 then
    redis.call('SET', key, value, 'PX', ttl)
  else
    redis.call('SET', key, value)
  end
end
local published = {}
local argumentIndex = 2
for index = 1, #KEYS, 2 do
  local expectedHash = ARGV[argumentIndex]
  local hashToPublish = ARGV[argumentIndex + 1]
  local data = ARGV[argumentIndex + 2]
  local currentHash = redis.call('GET', KEYS[index]) or ''
  if currentHash == expectedHash then
    set(KEYS[index], hashToPublish)
    if data ~= '' then
      set(KEYS[index + 1], data)
    end
    table.insert(published, 1)
  else
    table.insert(published, 0)
  end
  argumentIndex = argumentIndex + 3
end
return published
`,
};
