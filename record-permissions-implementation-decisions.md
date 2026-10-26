# Record permissions implementation decisions

This log records engineering choices made while building `codex/record-permissions-product` from `main` at `4c48997ee70`. The agreed product behavior remains in [the design](design-doc-record-permissions.md).

## Working order

1. Shared action, capability, rule, and field-path model with behavioral tests.
2. Portable metadata, workspace projection storage, and durable invalidation.
3. Live authorization, projected collection authorization, sharing delegation, and authority intersections.
4. Recompute workers, reconciliation, and atomic policy publication.
5. Role permission cards, related-record paths, and sharing UI.
6. Local product verification, regression tests, and realistic performance measurements.

## Decisions

- Keep the previous implementation available until a workspace explicitly activates a completed policy revision. Feature flags expose the new authoring flows; disabling a flag cannot remove enforcement of an already active policy.
- Use the existing predicate conversion and SQL renderer for conditions, including dynamic member fields. Permission rules must not introduce a second interpretation of operators.
- Persist immutable policy revisions in core metadata using universal identifiers. Keep runtime access groups, source shares, progress, and durable work in the workspace schema. An explicit export/import representation must preserve policy identities without copying record shares.
- Use database invalidation triggers on enrolled business tables so ordinary ORM operations, application writers, imports, and raw SQL participate in the same durable propagation contract. Projection-only updates must not fire business invalidations.
- Record capabilities remain application-owned object metadata, separate from editable role grants. User/API policy editing cannot loosen them.

## Verification

The artifact has been exercised through the local application, GraphQL APIs, focused behavioral tests, and isolated PostgreSQL benchmarks. The evidence and its limits are recorded below; these measurements do not establish production isolation or a general worst-case latency guarantee.

## Implementation choices made during integration

- The new authoring UI uses an opt-in `IS_RECORD_PERMISSION_POLICIES_ENABLED` flag in addition to the existing RLS and record-sharing flags. Conditional rule publication keeps the existing enterprise entitlement check. Already-published enforcement survives a flag being disabled, so disabling a UI feature cannot reopen private records.
- Whole-object defaults are portable role rules. Each object derives its own stable rule identity; explicit object overrides are scoped to one role. Editing a role must not copy another role's resolved defaults into permanent overrides.
- Receive is inherited with the other actions. An explicit share on a descendant can use a Receive rule inherited from an ancestor. Its access group identifies both the shared object and the original Receive rule. Source shares still remain a single cross-object workspace table.
- Source grants do not create permanent creator ownership in the new mode. Existing application and workflow share producers retain their explicit grants and provenance; creating a record alone does not confer ownership.
- Database triggers retain the old and new IDs and owning relation columns needed for propagation. They do not store full business records in the durable queue. Projection-only updates do not enqueue more work.
- Metadata changes enroll new objects and refresh relation indexes and triggers. Active and candidate policies protect their referenced fields, inverse relation fields, and objects against deletion or structural changes. Interrupted concurrent index builds are repaired before reuse.
- Point lookups include primary-key and complete, non-partial unique-index equality lookups. A collection with `LIMIT 1` remains a projected collection. Bulk writes select a bounded projected candidate set and then recheck it live, with the same live condition attached to the mutation.
- Application capabilities are strict boolean metadata; malformed or unknown capabilities are rejected on manifest conversion. Capability prohibitions are also applied when choosing projected groups, including inherited Receive, so stale arrays cannot override a current prohibition.
- File fields and rich-text file links require live read authorization before new URLs are signed. Navigation identifiers use live point authorization. Search keeps projected result membership but strips images from records that fail the live check before image URLs are issued.
- Foreground database work has a 250 ms statement deadline, a 50 ms lock budget, and admission limits of four queries per workspace and 32 per PostgreSQL instance. Search fan-out is capped at four. Background projection uses two database slots, short transactions, a 1.5-second statement deadline, adaptive batches, and a throughput ceiling. These are prototype defaults, not a claim that all workloads meet the performance target.
- Read access uses a GIN index with `fastupdate=off` on new installations to avoid foreground pending-list cleanup spikes during large rebuilds. Only the read array is indexed. Whole-object unconditional grants use the compiler fast path and need no redundant direct array entries; inherited grants still require projection.

## Local verification notes

- Local development data was backed up before running the normal instance/workspace upgrade commands. A stale rich-text migration and an absent technical relation target prevented the existing company view from rendering. The idempotent rich-text upgrade was rerun, and query-field generation now omits unavailable relation targets instead of crashing the source record view.
- The company list renders with an active policy. Role cards, defaults, object overrides, field selectors, three-hop path configuration, sharing, policy publication/cancellation, and access explanations were exercised locally. Screenshots are in `.codex/permissions-rework/product/screenshots/`. The enterprise condition editor was tested at component level; the local workspace has no enterprise license, so its paywall was preserved during browser verification.
- Focused tests cover live/projected equivalence, three-hop inheritance, inherited Receive, source-share revocation, 1,000 recipients, old/new relation endpoints, atomic activation, independent authorities, creator behavior, capabilities, dynamic conditions, field restrictions, domain readers, and PostgreSQL cancellation/admission. Final counts are recorded in the verification section below.
- A complete 10M-row projection finished within the agreed 60-minute budget. Broader production acceptance remains open: the full-run neighboring-tenant probe recorded nine errors, and the tested rows had at most two read access groups. Neither that result nor a smaller zero-error run establishes every distribution or production concurrency case.

## Decisions from scale and concurrency testing

- Full scans use bounded physical-page ranges, with primary keys as record identities. Scanning random UUID primary keys caused unnecessary heap I/O during projection writes. The scan records the relation file identity and restarts if `VACUUM FULL`, `CLUSTER`, or another rewrite changes it. Business writes remain covered by the transactional invalidation queue. Completion means reaching the captured page boundary, not merely counting 10M visits.
- The projector evaluates identical predicates once per batch, shares source-grant computations across actions with identical access levels, and omits redundant groups where an unconditional role action already grants the whole target object. JIT is disabled in permission-budgeted transactions because compilation cost is harmful for these short statements.
- Database connection checkout is bounded as well as statement execution. Late checkouts are released without running work. The local admission queue is bounded per workspace and globally; database advisory slots also cover multiple server processes.
- Sharing transactions acquire the workspace fence exclusively before locking the target and refreshing authority. This serializes sharing with ancestor/member changes and publication. Creating a record with explicit shares uses the same discipline and checks Share plus each delegated action. Grants from a previously destroyed record ID are removed before checking a reused ID. A failure rolls back creation and its grants together.
- Direct and inherited source grants are paginated in pages of 100. No descendant provenance rows are introduced. The sharing panel loads further pages explicitly.
- The existing owning-application gate remains available only for objects already marked APPLICATION. Explicit record capability prohibitions still apply. This preserves existing producers while application install permissions remain undecided; it is not a general application bypass.
- Active role assignments and application role IDs are read from primary metadata rather than relying on role-target cache freshness. Missing required authority fails closed. Additional repository role constraints continue to narrow access.
- Cancel requests must name the current candidate. Cancellation, bounded retired-state cleanup, and projection results use outer SELECT statements so PostgreSQL and TypeORM expose the same row-result shape. Retired core revisions remain available as history; obsolete workspace work, scans, expansions and groups are removed in bounded batches.
- Idle workspaces skip policy/group compilation. Periodic reconciliation still schedules a resumable object scan, rather than repeatedly rewriting every object.
- Policy transfer is an explicit validated JSON import/export for the artifact. It includes portable role rules and field-based paths, excludes source shares and runtime groups, and does not include existing field-permission settings. Automatic application-manifest synchronization of complete policies is a separate extraction step.
- The role editor saves existing field-permission settings before publishing a new record-policy candidate. A later candidate failure does not roll back the field settings; the UI reports the failure and retains the record policy draft. Making the two persistence systems atomic requires a separate schema/API consolidation.
- Timeline readers retain the authenticated caller when the new policy is active, including counts and searches. Existing channel privacy remains an additional restriction. New avatar URLs require a live person read check. Uploads of new temporary files and preexisting bearer-link expiry behavior retain their existing contract.

- Current record capabilities and legacy readability/writability are reloaded from primary metadata. Role assignment, application-role, permission and object-metadata mutations take the same workspace fence as sharing/publication. This closes stale-cache windows without relying on a feature flag or background convergence to enforce hard prohibitions.
- Related-person lookup checks the source record live before returning or traversing related IDs. Timeline and calendar collections remain projected, with live checks before new avatar links are issued.
- Access explanations require the caller to hold Read and Share. They evaluate the selected member's ordinary role on the current record, not an assumed API/application intersection. Responses identify matching groups/rules and field paths but omit ancestor record IDs, predicate values and free-form rule labels. The response shows up to 100 matching sources and explicitly reports truncation; the allow/deny decision considers every source.

- Subscription and application/agent trigger events resolve current role assignments from primary metadata. If those assignments differ from the cached field-permission context, delivery is suppressed until the cache catches up. Existing explicit-role automation contexts remain valid; identity-free webhooks have no role or Receive grant and are denied under the active private policy. Event payloads use the live evaluator on the event snapshot and current related records; this intentionally differs from projected collection visibility.

## Final verification

- Server: **41 suites, 364 tests passed**, including the real PostgreSQL permission, cancellation and query-budget suites. The three opt-in scale benchmarks are excluded from this ordinary run and recorded separately below.
- Frontend: **5 suites, 18 tests passed**, including condition editing, draft isolation, sharing and access explanation.
- Direct server/frontend TypeScript checks passed. Type-aware lint passed for changed server/frontend/shared files. Shared packages were rebuilt without the Nx cache, metadata GraphQL generation succeeded, and the diff passed whitespace checks.
- The local frontend, server and worker ran together. The final sharing panel returned a successful live explanation after the last server restart, with no browser console errors.

To reproduce the SQL suites, set `RECORD_PERMISSION_TEST_DATABASE_URL` to a disposable PostgreSQL database whose name ends in `_permission_test` and run the specs with the server Jest configuration. This variable differs from `PERMISSION_BENCHMARK_DATABASE_URL`, which is reserved for scale fixtures. The exact server/frontend file lists are saved beside `verification-results.json`; pass each list to `xargs npx jest --runInBand` with its package Jest configuration.

## Scale evidence

The recorded runs used the installed PostgreSQL 15 on a 32 GB Mac, with a dedicated benchmark cluster using 2 GB shared buffers and 8 GB effective cache size. The normal development database was untouched by the scale fixtures. Foreground SQL had a 250 ms server deadline; projection had a 1.5 second deadline, bounded physical-page batches and a 3,000-row/second ceiling. This differs from the design's proposed PostgreSQL 16 acceptance environment and must be rerun there before production rollout.

| Run | Result | Limits |
| --- | --- | --- |
| Full 10M business rows, 1,000 members, 50K source shares | 10,000,000 rows verified projected; 55m54s scan/projection; one retried batch; same-tenant read p99 18.1 ms, 16,478 successful reads and zero read errors | 256-byte payload, four B-tree indexes and one read GIN; at most two read groups per row. Used the projector before the final predicate-deduplication optimization. |
| Neighboring 1M-row tenant during the full rebuild | 201,993 successful queries; p50 2.6 ms, p99 32.1 ms; nine errors | Four clients. Six PostgreSQL cancellations coincided with local compilation pressure; three errors lack detailed capture. Causality is not established. This is not a zero-error isolation pass. |
| Idle neighboring-tenant baseline | 5,123 successful queries in 60 seconds; p50 1.82 ms, p99 16.55 ms, zero errors | Same four-client probe after the rebuilds; short warm baseline, not a production load profile. |
| Controlled 1M-row segment on the existing 10M table | 5m35s; zero retries; same-tenant p99 10.6 ms, zero errors; neighboring tenant 29,400 successful queries, p99 17.4 ms, zero errors | Latest projector, four neighboring clients, compilation kept outside the interval. This processed a segment, not a second full 10M rebuild. |
| Final 50K shares, 30 descendants each, three relation fields | All 1.5M descendants verified projected in 8m21s, zero retries; 100 successful live-point reads p99 4.60 ms; inherited-share lookup p99 1.85 ms | Correct recipient checks were asserted in the final run. The earlier run measured denied reads and then failed in an unrelated dynamic fixture; its error remains in the historical report. |
| 1,000 dynamic member bindings | 1,000 groups; binding 19.6 ms; 100-row projection 99.3 ms | Separate bounded case, not 1,000 overlapping matching groups on every row of a 10M table. |

The full rebuild generated 25.41 GB of WAL and grew the table plus indexes from 6.13 GB to 8.94 GB before subsequent maintenance. This is a material write-amplification and storage cost, even though the measured rebuild met the time budget. New group identities, role/member changes and inheritance fanout still need workload-specific sizing.

Reports and screenshots are under `.codex/permissions-rework/product/`. Failed and exploratory runs remain available locally; only the relevant evidence is part of the product commit. A clean shorter interference run does not replace the full-run result.

## Product testing

Run `yarn start` from the repository root to start the frontend, backend and worker. The current local frontend is at `http://localhost:3001`; the server is at `http://localhost:3000`. Use **Continue with Email** and the prefilled development credentials. The Apple workspace already has a completed policy and the three authoring flags enabled: `IS_RECORD_PERMISSION_POLICIES_ENABLED`, `IS_ROW_LEVEL_SECURITY_ENABLED`, and `IS_RECORD_LEVEL_SHARING_ENABLED`.

1. Open **Settings → Roles → Member → Permissions**. Inspect global defaults, override a Company's action, and save. The old policy remains active during computation; completion switches all objects to the candidate revision together. Cancel only affects the named current candidate.
2. Open **Settings → Data model → Companies → Settings → Related records**. Select actual relation fields, including technical intermediates, up to three hops. The configuration belongs to the workspace policy draft and must be saved/published.
3. Open a company and its **Share** panel. Add a member at a held/delegable level, change the level, revoke it, inspect inherited grants, and use **Explain access**. A recipient also needs Receive. Removing a share may leave role/inherited access intact.
4. Sign in as a different seeded member to compare access. Tim is Object-restricted, Jane is Admin, Jony and Sara are Member. Sharing changes affect live detail reads immediately; lists converge asynchronously.
5. Export a policy from role settings, inspect the portable JSON, and import it into a compatible workspace. The import validates role/object/field identities; it does not transfer record shares, field-permission settings or runtime groups.

The API verification reports cover share/revoke, rejected delegation, creation with explicit grants, rollback of rejected creation, bulk updates, timeline reads, and explanation authorization. Test records and temporary grants were removed, and the original policy was restored after UI publication checks. One cold create statement hit the 250 ms budget before a retry succeeded; tight interactive budgets require further cold-cache product testing.

## Reproduction and rollout limits

The opt-in benchmark specs live in `packages/twenty-server/src/engine/core-modules/record-permission/utils/__tests__/`. They require an explicitly named, disposable permission benchmark database and do not run in the ordinary test suite. Set `PERMISSION_BENCHMARK_DATABASE_URL` and run the desired spec with the server Jest configuration and `--runInBand`:

- `PERMISSION_BENCHMARK=1 PERMISSION_BENCH_ROWS=10000000` for the complete business-table rebuild; `PERMISSION_BENCHMARK_REPORT` sets its JSON output.
- `PERMISSION_INHERITANCE_BENCHMARK=1` for the 50K × 30 three-hop fixture; `PERMISSION_INHERITANCE_BENCHMARK_REPORT` sets its output. Use a clean fixture schema.
- `PERMISSION_DYNAMIC_BENCHMARK=1` for the dynamic-binding case; consult its spec for report configuration.
- `other-tenant-probe.cjs` adds four clients against a separate 1M-row schema in the same benchmark database; its environment variables specify the progress and output files. Omit `PERMISSION_BENCHMARK_REPORT` and set `PERMISSION_TENANT_PROBE_DURATION_MS` to take an idle baseline.

Before extracting a production rollout, repeat on the deployment PostgreSQL version with realistic CPU/I/O, multiple application instances, cold-cache and dense overlapping-group cases, sustained updates, exact counts/aggregates, exports and hostile query shapes. Database admission and deadlines bound work; they do not guarantee physical tenant isolation. This artifact does not introduce approximate counts, resumable arbitrary SQL, or a full request-wide deadline beyond the database/admission budgets.

The isolated benchmark cluster and fixtures are retained at `/tmp/twenty-permission-benchmark-pg` (socket `/tmp/twenty-permission-benchmark-socket`, port 55435) and are stopped after the runs. The normal local application database, frontend, server and worker remain available.

The design's dependency-ordered PR map still applies. Extract schema/capabilities and behavior fixtures first, then compilation/storage, propagation/publication, repository enforcement, alternate readers, UI and explanations. Keep enforcement dormant until its complete dependency chain is present. Automatic full-policy application-manifest synchronization, atomic field-policy publication, broader operational metrics and production load acceptance remain explicit follow-up extraction work.
