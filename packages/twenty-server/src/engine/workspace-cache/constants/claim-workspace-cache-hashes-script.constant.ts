import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const CLAIM_WORKSPACE_CACHE_HASHES_SCRIPT: CacheScript = {
  name: 'workspace-cache:claim-hashes',
  source: `
local ttl = tonumber(ARGV[1])
local hashes = {}
for index = 1, #KEYS, 2 do
  local hash = redis.call('GET', KEYS[index])
  if not hash then
    hash = ARGV[(index + 1) / 2 + 1]
    redis.call('DEL', KEYS[index + 1])
    if ttl > 0 then
      redis.call('SET', KEYS[index], hash, 'PX', ttl)
    else
      redis.call('SET', KEYS[index], hash)
    end
  end
  table.insert(hashes, cjson.decode(hash))
end
return hashes
`,
};
