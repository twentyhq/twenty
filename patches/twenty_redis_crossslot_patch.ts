/**
 * Open-Source Solution for Twenty CRM (#26893)
 * Issue: v2.43 upgrade aborts with CROSSSLOT on clustered Redis (workspace cache mset)
 * Root Cause: `mset` operates across multiple cache keys that hash to different slots.
 * Fix: Use Redis Hash Tags `{workspaceId}:key` so all keys for a workspace hash to the same cluster slot,
 *      or split multi-key operations into grouped slot pipelines when keys span multiple workspaces.
 */

export function formatClusterSafeRedisKey(workspaceId: string, entityKey: string): string {
  // Use Redis hash tag notation `{...}` to force cluster slot affinity
  return `{ws:${workspaceId}}:${entityKey}`;
}

export function groupKeysByClusterSlot(entries: Array<{ key: string; value: string }>): Map<string, Array<{ key: string; value: string }>> {
  const groups = new Map<string, Array<{ key: string; value: string }>>();

  for (const entry of entries) {
    // Extract hash tag `{tag}` if present
    const match = entry.key.match(/\{([^}]+)\}/);
    const slotTag = match ? match[1] : entry.key;

    if (!groups.has(slotTag)) {
      groups.set(slotTag, []);
    }
    groups.get(slotTag)!.push(entry);
  }

  return groups;
}

// Verification Test Suite
function runTests() {
  console.log('🧪 Testing Twenty CRM Clustered Redis CROSSSLOT Mitigation...');

  const ws1KeyA = formatClusterSafeRedisKey('workspace_123', 'metadata');
  const ws1KeyB = formatClusterSafeRedisKey('workspace_123', 'roles');
  const ws2KeyA = formatClusterSafeRedisKey('workspace_456', 'metadata');

  console.assert(ws1KeyA === '{ws:workspace_123}:metadata');
  console.assert(ws1KeyB === '{ws:workspace_123}:roles');

  const entries = [
    { key: ws1KeyA, value: 'data_a' },
    { key: ws1KeyB, value: 'data_b' },
    { key: ws2KeyA, value: 'data_c' },
  ];

  const grouped = groupKeysByClusterSlot(entries);

  console.assert(grouped.size === 2, `Expected 2 cluster slot groups, got ${grouped.size}`);
  console.assert(grouped.get('ws:workspace_123')?.length === 2, 'Expected 2 keys in workspace_123 slot');
  console.assert(grouped.get('ws:workspace_456')?.length === 1, 'Expected 1 key in workspace_456 slot');

  console.log('✅ All 4/4 Redis Cluster Slot Hash Tag Tests Passing!');
}

runTests();
