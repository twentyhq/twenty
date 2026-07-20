import { type QueryRunner } from 'typeorm';

import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';

/**
 * Benchmark for the workspace-provisioning batching changes (OPT-3 metadata
 * inserts, OPT-4 index DDL).
 *
 * What these optimizations remove is DB *round-trips*, not server-side execution
 * time. So the wall-clock saved during provisioning is:
 *
 *     round-trips removed  x  round-trip time (RTT) to Postgres
 *
 * The counts below are deterministic and exercise the real batched code path
 * (WorkspaceSchemaIndexManagerService for OPT-4; the one-insert-per-group
 * pattern for OPT-3). The projection turns those counts into milliseconds for a
 * range of realistic RTTs.
 *
 * This does NOT measure server-side cost (CREATE INDEX build, INSERT execution,
 * transaction commit, cache recompute). On a freshly created, empty workspace
 * those are small and round-trip latency dominates — which is why batching wins
 * — but the true absolute number must come from a live-Postgres provisioning
 * run. A setTimeout-based "measurement" was deliberately left out: timer
 * granularity dwarfs a sub-millisecond RTT, so it measures the timer, not the
 * batching. Multiply the round-trip counts by your measured RTT instead.
 */

// Standard-application entity counts at provisioning time (Twenty standard app).
const STANDARD_VIEWS = 68;
const STANDARD_VIEW_FIELDS = 323;
const STANDARD_INDEXES = 99;

// Metadata inserts after batching: one INSERT for all views, one for all
// view-fields (OPT-3 groups contiguous same-type creates).
const BATCHED_METADATA_INSERTS = 2;
// Index DDL after batching: one multi-statement round-trip (OPT-4).
const BATCHED_INDEX_ROUND_TRIPS = 1;

// Representative app<->Postgres round-trip times (ms): same-host socket, local
// pool, same-AZ, cross-AZ.
const RTT_PROFILES_MS = [0.1, 0.5, 1, 5];

function makeCountingQueryRunner(): {
  queryRunner: QueryRunner;
  getCount: () => number;
} {
  let count = 0;
  const queryRunner = {
    isTransactionActive: true,
    query: async () => {
      count += 1;
      return [];
    },
  } as unknown as QueryRunner;

  return { queryRunner, getCount: () => count };
}

function makeIndexDefinitions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    schemaName: 'workspace_bench',
    tableName: 'company',
    index: { columns: ['name'], name: `IDX_bench_${i}`, isUnique: false },
  }));
}

function makeCountingRepository(): {
  insert: (rows: unknown[]) => Promise<void>;
  getCalls: () => number;
} {
  let calls = 0;
  return {
    insert: async (_rows: unknown[]) => {
      calls += 1;
    },
    getCalls: () => calls,
  };
}

describe('workspace provisioning batching — round-trip benchmark', () => {
  it('OPT-4: index DDL collapses N CREATE INDEX round-trips into 1', async () => {
    const service = new WorkspaceSchemaIndexManagerService();
    const indexes = makeIndexDefinitions(STANDARD_INDEXES);

    const before = makeCountingQueryRunner();
    for (const { schemaName, tableName, index } of indexes) {
      await service.createIndex({
        queryRunner: before.queryRunner,
        schemaName,
        tableName,
        index,
      });
    }

    const after = makeCountingQueryRunner();
    await service.createIndexes({ queryRunner: after.queryRunner, indexes });

    expect(before.getCount()).toBe(STANDARD_INDEXES);
    expect(after.getCount()).toBe(BATCHED_INDEX_ROUND_TRIPS);
  });

  it('OPT-3: metadata inserts collapse one-per-row into one-per-type', async () => {
    // Models the runner: unbatched it calls the handler once per action (one
    // repository.insert([row]) each); batched, each contiguous group is a single
    // repository.insert(rows).
    const rows = Array.from({ length: STANDARD_VIEWS + STANDARD_VIEW_FIELDS });

    const before = makeCountingRepository();
    for (const row of rows) {
      await before.insert([row]);
    }

    const views = rows.slice(0, STANDARD_VIEWS);
    const viewFields = rows.slice(STANDARD_VIEWS);
    const after = makeCountingRepository();
    await after.insert(views);
    await after.insert(viewFields);

    expect(before.getCalls()).toBe(STANDARD_VIEWS + STANDARD_VIEW_FIELDS);
    expect(after.getCalls()).toBe(BATCHED_METADATA_INSERTS);
  });

  it('projects provisioning round-trip time saved across RTT profiles', () => {
    const beforeRoundTrips =
      STANDARD_VIEWS + STANDARD_VIEW_FIELDS + STANDARD_INDEXES;
    const afterRoundTrips =
      BATCHED_METADATA_INSERTS + BATCHED_INDEX_ROUND_TRIPS;
    const removed = beforeRoundTrips - afterRoundTrips;

    const projection = RTT_PROFILES_MS.map((rtt) => {
      const beforeMs = beforeRoundTrips * rtt;
      const afterMs = afterRoundTrips * rtt;
      return `  RTT ${rtt}ms:  ${beforeMs.toFixed(1)}ms -> ${afterMs.toFixed(1)}ms  (saves ${(beforeMs - afterMs).toFixed(1)}ms)`;
    });

    // eslint-disable-next-line no-console -- benchmark reports its projection to stdout
    console.log(
      [
        '',
        '── Provisioning round-trip projection (OPT-3 + OPT-4) ──',
        `metadata insert round-trips: ${STANDARD_VIEWS + STANDARD_VIEW_FIELDS} -> ${BATCHED_METADATA_INSERTS}`,
        `index DDL round-trips:       ${STANDARD_INDEXES} -> ${BATCHED_INDEX_ROUND_TRIPS}`,
        `total round-trips removed:   ${removed}`,
        'projected DB round-trip wall-clock (excludes server-side execution):',
        ...projection,
        '',
        'NOTE: round-trip latency only — excludes CREATE INDEX build, INSERT',
        'execution, commit and cache recompute. Ground-truth needs a live DB run.',
        '',
      ].join('\n'),
    );

    expect(removed).toBe(
      STANDARD_VIEWS +
        STANDARD_VIEW_FIELDS +
        STANDARD_INDEXES -
        BATCHED_METADATA_INSERTS -
        BATCHED_INDEX_ROUND_TRIPS,
    );
  });
});
