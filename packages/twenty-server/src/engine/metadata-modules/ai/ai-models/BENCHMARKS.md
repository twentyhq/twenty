# Benchmark snapshots

Artificial Analysis API access belongs to the publisher in twenty-infra.
Twenty only consumes a complete JSON snapshot and matches it to configured
models. The frontend continues to receive benchmarks through client-config.

## Configuration

Set AI_BENCHMARKS_SNAPSHOT_URL to the published HTTPS URL. There is intentionally
no default URL until the shared feed is deployed. Self-hosters can use the same
feed or an internally hosted URL with the same schema. Set AI_BENCHMARKS_ENABLED
to false, or omit the URL, to disable all benchmark downloads.

The request sends no API key, model list, workspace data, or authentication
headers. As with any HTTP request, the host can observe the server's IP address.
Redirects are rejected; configure the final snapshot URL directly.

The service starts a nonblocking download during module initialization and
refreshes on a client-config read after 24 hours. Concurrent reads share the
same pending download. Each request times out after five seconds. A failed
download keeps the previous snapshot and waits one hour before trying again.
Snapshots older than seven days, dated in the future, malformed, or carrying
an unsupported schema version are rejected.

The cache is in process. After a restart, the first browser request may have no
benchmarks until the snapshot is downloaded. Existing browser sessions need
another client-config fetch to receive the data. There is no database, Redis
state, API quota handling, or benchmark cron in Twenty.

## Snapshot contract

The root object has schemaVersion (currently 1), fetchedAt (UTC ISO timestamp),
intelligenceIndexVersion (positive number), and models (nonempty array).
Each model has id, name, and slug, plus optional Artificial Analysis evaluation,
performance, and cost-per-task fields, as validated by
artificial-analysis-snapshot.schema.ts. Unknown metrics are null or omitted,
never fabricated as zero. Model IDs must be unique.

The publisher must preserve the upstream measurement identity and reasoning
configuration. Matching remains in Twenty; publishing never aliases versions.

## Rollout

Deploy and verify the infra feed first, then configure its URL in Cloud and
document the shared URL for self-hosters. Public redistribution must be covered
by the data supplier's terms before enabling public access.

Remove ARTIFICIAL_ANALYSIS_API_KEY and ARTIFICIAL_ANALYSIS_SYNC_ENABLED from
Twenty's deployment secrets/configuration. Existing installations that ran the
unmerged benchmark cron must also remove its ArtificialAnalysisSyncCronJob
repeatable entry from the cron queue during rollout. The new code no longer
registers or processes that job. The global cache:flush command again flushes
all namespaces without a benchmark exception.
