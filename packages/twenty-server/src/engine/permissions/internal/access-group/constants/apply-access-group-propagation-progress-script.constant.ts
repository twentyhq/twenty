/* @license Enterprise */

import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

// ARGV: now, stale after ms, then (command, field, value) triplets
export const APPLY_ACCESS_GROUP_PROPAGATION_PROGRESS_SCRIPT: CacheScript = {
  name: 'access-group:apply-propagation-progress',
  source: `
local staleBefore = tonumber(ARGV[1]) - tonumber(ARGV[2])

for index = 3, #ARGV, 3 do
  redis.call(ARGV[index], KEYS[1], ARGV[index + 1], ARGV[index + 2])
end

local entries = redis.call('HGETALL', KEYS[1])

for index = 1, #entries, 2 do
  local unit = string.match(entries[index], '^touchedAt:(.+)$')

  if unit and tonumber(entries[index + 1]) < staleBefore then
    redis.call('HDEL', KEYS[1], 'total:' .. unit, 'remaining:' .. unit, 'touchedAt:' .. unit)
  end
end

entries = redis.call('HGETALL', KEYS[1])

for index = 1, #entries, 2 do
  if string.find(entries[index], '^remaining:') and tonumber(entries[index + 1]) > 0 then
    if #ARGV > 2 then
      redis.call('PEXPIRE', KEYS[1], ARGV[2])
    end

    return entries
  end
end

redis.call('DEL', KEYS[1])

return {}
`,
};
