# Record permissions implementation decisions

This log records engineering choices made while building `codex/record-permissions-product` from `main` at `4c48997ee70`. The agreed product behavior remains in [the design](design-doc-record-permissions.md).

## QA status

The requested permission and sharing flows are implemented and exercised. **Full scale acceptance is not complete.** The dense-binding test below demonstrates that the current representation cannot meet the one-hour target for every supported 1,000-member predicate distribution. The full rebuild's neighboring-tenant probe also recorded cancellations. Feature flags must remain opt-in; these results do not justify a production rollout.

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

## Initial artifact verification

- Server: **41 suites, 364 tests passed**, including the real PostgreSQL permission, cancellation and query-budget suites. The three opt-in scale benchmarks are excluded from this ordinary run and recorded separately below.
- Frontend: **5 suites, 18 tests passed**, including condition editing, draft isolation, sharing and access explanation.
- Direct server/frontend TypeScript checks passed. Type-aware lint passed for changed server/frontend/shared files. Shared packages were rebuilt without the Nx cache, metadata GraphQL generation succeeded, and the diff passed whitespace checks.
- The local frontend, server and worker ran together. The final sharing panel returned a successful live explanation after the last server restart, with no browser console errors.

To reproduce the SQL suites, set `RECORD_PERMISSION_TEST_DATABASE_URL` to a disposable PostgreSQL database whose name ends in `_permission_test` and run the specs with the server Jest configuration. This variable differs from `PERMISSION_BENCHMARK_DATABASE_URL`, which is reserved for scale fixtures. The exact server/frontend file lists are saved beside `verification-results.json`; pass each list to `xargs npx jest --runInBand` with its package Jest configuration.

## Scale evidence

The recorded runs used the installed PostgreSQL 15 on a 32 GB Mac, with a dedicated benchmark cluster using 2 GB shared buffers and 8 GB effective cache size. The normal development database was untouched by the scale fixtures. Foreground SQL had a 250 ms server deadline; projection had a 1.5 second deadline, bounded physical-page batches and a 3,000-row/second ceiling. The subsequent QA run below uses PostgreSQL 16; these PostgreSQL 15 results remain historical evidence.

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


## QA fixes and feature coverage

This pass used the running frontend, server and worker, real GraphQL/REST/SSE requests, a separate SQL test database, browser checks, and isolated PostgreSQL 16 scale fixtures. No production services or data were used. The original feature scope is distinct from the open performance gates.

| Requested capability | Coverage in the artifact | QA evidence |
| --- | --- | --- |
| Object and field permissions | Role defaults and object overrides; restrictive field permissions; candidate record policy saved from the role editor | Role-save tests, live denied field selection/filter/sort/export, browser role cards |
| RLS | Additive conditional action grants, current-member values, enterprise authoring gate; unchanged conditions remain enforceable when authoring is disabled | Predicate/authority SQL tests, condition editor tests, entitlement-change tests; the local browser license remains non-enterprise |
| Record sharing | Cross-object workspace source grants; members/roles/everyone; delegation bounded by held rights; inherited grants resolved in SQL | Live share/revoke and Receive tests; browser sharing and explanations; through-role summaries for 1,000 members |
| Related records | Field-based inheritance, total depth three, technical intermediates, all six actions subject to target capabilities | SQL equivalence and retarget/delete tests, three-hop benchmark, browser path editor |
| Portable storage | Immutable core policy revisions with universal identifiers; runtime groups/source grants/progress in workspace schemas | Validated JSON policy transfer; metadata validation tests. Full-policy automatic application-manifest synchronization remains the explicit implementation deviation described above |
| On-record projections | Six access-group arrays, read GIN, unconditional-grant fast paths | Live/projected equivalence, bounded scans, large rebuild and dense-binding measurements |
| Propagation and cron recovery | Durable database invalidation, resumable workers, rotating reconciliation, candidate catch-up and atomic activation | Real SQL worker tests; missed-tick/resume tests; live candidate publication/cancellation and export invalidation |
| Query enforcement | Live point/unique-key/sharing authorization; projected collections, nested reads, counts and exports; live rechecks for bounded bulk writes | Repository/domain-reader regression suites and authenticated API checks |
| Record capabilities | Application-owned hard prohibitions, enforced from primary metadata and represented in the application object definition | Capability, manifest-conversion, delegation and export-hash tests |
| Feature flags and roles | Separate policy/RLS/sharing authoring gates; active enforcement persists if flags are disabled; API/user/application/agent authority intersection | Live flag-off denial, API-role reassignment/revocation, authority/event tests |

Fixes made during this QA pass:

- Reconciliation now uses durable completion timestamps and rotates the oldest completed object. A missed cron window cannot prevent reconciliation indefinitely, and an unfinished scan keeps its progress.
- The settings UI distinguishes the currently enforced policy from a candidate still being computed. The active view is read-only. Conditional authoring requires the entitlement for changes to the entire conditional grant, including its role and actions, while unrelated sharing/default changes can proceed.
- Through-role access is computed from actual current members and their dynamic bindings. Static roles are evaluated once, mixed access is labeled explicitly, and explicit role shares remain in the direct-sharing section. Nested read-only sharing helpers can reuse the same authorization context; writes do not reuse that scope.
- Sharing changes acquire the publication fence with a bounded series of nonblocking attempts, waiting outside transactions and connection slots. This absorbs a short projector batch without immediately surfacing a 50 ms lock timeout. Authority is refreshed only after the fence is acquired; authorization/write failures are never replayed. Persistent contention still fails closed. A real PostgreSQL regression holds the projector's shared fence while the sharing attempt waits.
- Export hashes now include the active revision and hard capability metadata read from primary storage. A completed export becomes unavailable after policy activation even before cache refresh. Export errors preserve safe permission messages.
- Exact counts no longer prevent the ordinary ungrouped table from opening when its page is cheap. After a typed SQL timeout, the table retries the same authorized page without requesting a count. It uses `hasNextPage` to extend the scrollable range, discovers the final row naturally, rejects stale page responses, and never labels the provisional range as an exact count. Selection is limited to loaded rows while the total is unknown; end-of-table append/drop actions remain hidden until the end is known. Count and aggregate API contracts remain exact and can still time out. Unindexed filters and deep offsets are not made cheap by this fallback.
- The projector normalizes parameterized predicates before reusing their results. Dense predicates are packed into a boolean array instead of thousands of SELECT columns, avoiding PostgreSQL's target-list limit without dropping any grant. Conditional Receive bindings share an indexed source-share lookup per inheritance path instead of generating a separate UNION subplan for every binding.
- Physical scans persist a tuple offset within the current heap page. Reducing a projection batch to one record now also reduces the scan batch to one record. Tests cover resume, row movement during projection, and table rewrites. The unpublished artifact's workspace installer adds this internal cursor column; the local workspace was upgraded through ordinary policy publication.
- A stale local morph-relation-head backfill prevented company details from rendering. The existing `upgrade:2-48:backfill-morph-relation-heads` command repaired that development fixture; no alternate metadata interpretation was added to the product.

The expanded test manifests are `qa-server-test-files.txt` and `qa-front-test-files.txt` under the product evidence directory. The final QA report records suite counts and commands. One broad server test process terminated with a native signal; the subsequent full rerun passed. Live sharing mutations twice exposed the short lock-deadline contention, which prompted the bounded acquisition fix above; `qa-live-api-lock-contention-before-fix.json` preserves the second failure and successful cleanup. A later first load of the sharing panel hit the 250 ms SQL deadline while reading role subjects; the explicit Try again action succeeded. These failures remain part of the evidence, even though their subsequent attempts succeeded.

## Dense-binding acceptance failure

The PostgreSQL 16 dense fixture has 1,000 members with distinct text bindings, all matching each of 100 business records, with all six actions granted. A second distinct rule doubles the number of matching groups. It is intentionally an adversarial supported distribution, not a representative owner/region workload.

| Case | Correct result | Measured cost |
| --- | --- | --- |
| One rule | 1,000 groups in each of six action arrays; all 100 records correct | About 99,416 bytes per composite row; 8.31 seconds including two adaptive retries; final batch size 25 |
| Two distinct rules | 2,000 groups in each action array; all 100 records correct | About 195,416 bytes per row; 23.91 seconds including four retries; final batch size six |

These are small-fixture measurements, not extrapolated throughput guarantees. The 1,000-group UUID payload alone is 960 GB across six columns at 10M rows before other storage costs; repeated rule predicates also impose substantial projection CPU work. Correct bounded execution does not satisfy the one-hour requirement for this distribution. No grants are truncated and no new product limit has been silently imposed. A representation that compresses dense matching sets, an exact alternative for such predicates, or an explicit workload constraint is needed before claiming the complete worst-case target.

Reports preserve the initial column-limit failure, the fixed-size batch cancellations, and the final adaptive success. The successful dense run validates correctness and bounded SQL statements, not the 10M-row rebuild SLO.

## PostgreSQL 16 QA evidence

These runs used a separate PostgreSQL 16 cluster with the same 2 GB shared-buffer configuration. Its files are retained at `/tmp/twenty-permission-benchmark-pg16`, with a Unix socket at `/tmp/twenty-permission-benchmark-socket16` and port 55436. The normal PostgreSQL 15 development database was not replaced. The fixture has 10M business records, 1,000 members, 50K source shares, a 256-byte business payload, four B-tree indexes and one read GIN index. Its ordinary distribution has at most two read groups per row; it must not be confused with the dense-binding fixture above.

| Run | Result | Interpretation |
| --- | --- | --- |
| Complete 10M-row projection | All 10M records verified; 55m59s projection/verification; one retried batch; 16,459 successful same-tenant reads, zero errors, p99 13.12 ms | Met the 60-minute target for this distribution. This ran before the final dense-compiler and tuple-cursor fixes. Its sparse city/read probe generally returned no rows; positive pagination was checked separately. |
| Neighboring tenant during that full run | 301,799 successful queries, three PostgreSQL cancellations; p50 1.31 ms, p99 25.45 ms; maximum successful client elapsed time 614.83 ms | Compilation, tests and dense probes also ran on the host during this interval. Causality is not established. This is not an isolation acceptance pass, and a server statement deadline is not an end-to-end latency guarantee. |
| Idle neighboring-tenant baseline | 5,371 successful queries in 60 seconds; zero errors; p50 1.38 ms, p99 13.65 ms, maximum 31.03 ms | Short warm baseline with four clients. |
| Final projector, 1M-row segment of the 10M table | 5m35s; zero retries; 1,646 successful same-tenant reads, zero errors, p99 16.06 ms | Includes final dense compiler and tuple cursor. This is a segment regression, not a complete second 10M scan. |
| Neighboring tenant during the final segment | 30,600 successful queries, zero errors; p50 1.62 ms, p99 20.92 ms, maximum 240.01 ms | Heavy compilation and test runners were kept outside this interval. A shorter clean run does not replace the full-run result. |
| Final three-hop inheritance, 50K shares × 30 descendants | All 1.5M descendants verified in 8m23s, zero retries; 100 positive live-point reads p99 6.34 ms; 100 inherited-share lookups p99 1.40 ms | Final compiler and tuple cursor; distinct physical visits can exceed the row count after row movement. Recipient correctness is asserted. |
| Neighboring tenant during inheritance | 47,201 successful queries, zero errors; p50 1.48 ms, p99 17.53 ms, maximum 179.05 ms | Four clients; heavy regression runners started after projection completed. |

The full-run cluster WAL delta was 20.53 GB, including concurrent dense-fixture writes; it is not an isolated measure of projector WAL. The company relation and indexes grew from 6.13 GB to 8.94 GB. The segment's WAL delta was 2.09 GB. These are material operating costs even where elapsed time meets the target.

The separate query-shape probe validates results against all 50 authoritative source grants for one recipient, including two cursor pages. Each successful shape has 100 samples and an `EXPLAIN (ANALYZE, BUFFERS)` plan in its JSON report:

| Query shape on the completed 10M table | Warm result |
| --- | --- |
| Broad ordered page, 50 rows | p99 2.07 ms; zero cancellations |
| Broad indexed-city page, 50 rows | p99 0.72 ms; zero cancellations |
| Sparse recipient page, 50 positive rows | p99 0.56 ms; zero cancellations |
| Sparse recipient plus indexed city, one positive row | p99 8.76 ms; zero cancellations |
| Zero-overlap access group | p99 1.71 ms; zero cancellations |
| Exact broad count | Three of three attempts canceled by the 250 ms deadline |
| Exact indexed-city count | Two of three canceled; one completed in 110.52 ms |
| Unindexed no-match substring filter | Three of three canceled |
| Offset 1,000,000 | Three of three canceled |

The isolated cluster was then restarted and the probe repeated. PostgreSQL shared buffers were reset, but the OS cache remained warm; later samples warmed progressively. Positive results and cursor pagination remained correct. Exact counts, the no-match filter and deep offsets retained the same cancellation pattern. Both runs verified that the connection remained reusable after cancellation. This is not a physical cold-disk benchmark.

The ordinary table's count-free fallback addresses the count failure only. It does not make arbitrary filters, deep offsets, grouped counts or aggregates meet an interactive deadline. These query shapes retain explicit timeout errors instead of unbounded database work.

## Acceptance still required

- Resolve the dense-group representation before promising the 10M/1,000-member target for every supported predicate. The current adaptive retry is a correctness fix, not that resolution.
- Repeat tenant isolation on deployment-like hardware and multiple application instances with sustained foreground traffic and competing expensive queries. The database-slot test covers cross-connection admission, but the benchmark does not simulate a complete multi-instance application fleet. The artifact bounds database statements, checkout and admission; it does not implement the design's full request-wide deadline or sustained-work fairness budget.
- Preserve an explicit timeout/error contract for expensive filters and aggregates. The new count-free table fallback has component tests and live count-free GraphQL verification; the 10M query-shape tests exercise SQL directly, not a browser connected to a 10M-record application workspace.
- Keep full-policy automatic application-manifest synchronization and atomic field/record-policy editing visible as implementation deviations. JSON transfer works for policy portability, and field restrictions remain enforced immediately, but these are not equivalent implementations of those broader integration goals.

No new product limit or weaker authorization rule was introduced to turn these open gates into a pass. This branch is suitable for product evaluation behind its flags; it is not certified for production rollout or described as fully performance-accepted.

## Final QA verification

- Server: **113 suites and 1,022 tests passed** after the final sharing-lock fix, including real PostgreSQL tests. Four opt-in benchmark suites are skipped in the ordinary run and have separate evidence. These are the permission and adjacent regression suites, not the complete monorepo test suite.
- Frontend: **46 suites and 186 tests passed**. Direct server/frontend TypeScript checks and type-aware lint passed; metadata GraphQL generation and whitespace checks passed.
- The final live API run passed private-default behavior, no implicit creator grant, flag-off enforcement, bounded delegation, inheritance, share persistence after grantor access loss, immediate live revocation, REST denial, and projected count convergence. Disposable records were removed. The original policy definition remains active with no pending candidate.
- A clean browser reload rendered company details and the sharing panel without new console errors. The enterprise editor remains component-tested because the local workspace is not licensed for browser authoring.
- Export/SSE/download checks passed, including field restrictions and invalidation of a completed export after a new policy activates. API role reassignment and key revocation checks passed.

The machine-readable report is `.codex/permissions-rework/product/qa-verification-results.json`. It includes reproduction commands, precise test scope, report references, known failures and implementation deviations. The final screenshots show through-role sharing and inspection of current permissions while a candidate is being computed. Both isolated benchmark clusters are stopped, their fixtures are retained, and the normal local frontend/server/worker remain available for product evaluation.

## Local RLS authoring setup correction (2026-10-27)

The earlier browser QA stopped at the enterprise gate because the local `.env` lacked a license. The repository already provides a signed development validity token in `packages/twenty-server/.env.test`, which `EnterprisePlanService` explicitly accepts in development and test environments. That fixture is now configured in the ignored local `.env`; the server and worker were restarted. No entitlement checks or production licensing behavior were changed.

The live workspace API now returns the RLS entitlement as enabled. The requested Object-restricted role page in Chrome shows the conditional editor with field, operator, value, and current-user controls. Its existing draft was left untouched. This verifies local access to the editor; it is not an additional browser publication/enforcement test. Evidence: `.codex/permissions-rework/product/screenshots/qa-rls-enterprise-enabled.png`.

## City-based company and task test (2026-10-27)

The local workspace now has a nullable text `workspaceMember.city` field. Tim Apple, assigned to the Object-restricted role, is left with `San Francisco`. That role's unconditional Company grants were replaced with `Address / City IS Me / City`, keeping its actions conditional on that comparison. Equality is literal and case-sensitive. Other roles' Company grants remain unchanged.

Tasks inherit from the explicit two-field path `Company.taskTargets → TaskTarget.task`. This replaces the prior TaskTarget-to-Task inheritance, which also admitted tasks through people and other object types. Inheritance paths are object-wide metadata, so this test changes the Task inheritance path for every role. Tim has no independent Task rule. The two old direct task shares for Tim refer to absent records; they were left untouched. The original policy snapshot remains locally available as `.codex/permissions-rework/product/city-rls-original-policy.json`.

Four companies and six tasks prefixed `RLS City Test` remain available for manual testing. They cover San Francisco, New York, South San Francisco, no city, an unlinked task, and a task linked to both cities. A task with multiple parents is granted access when at least one parent grants access; it appears only once in the list.

The live API test `node .codex/permissions-rework/product/qa-city-rls.cjs` checks unfiltered lists and exact counts against independent SQL-derived record IDs, seven-row cursor pagination, individual reads, REST denial, member city changes, company city changes, and task relinking. Its final run passed ten checks across nine phases without retries in the test client. San Francisco returns 71 companies and 72 tasks; New York returns 43 companies and 44 tasks. Null and empty member cities return no companies or tasks. Live point access changes immediately. Projected lists converged in about 20 seconds after member city changes and 2–5 seconds after company city or relationship edits. The test restores the San Francisco state and original fixture relationships.

This scenario exposed and fixed three implementation gaps:

- Address text subfields now support exact `IS` and `IS_NOT` operands in the editor, validation, and shared filter builder. Country selector and whole-address behavior remain unchanged.
- Empty dynamic member values previously disappeared from the filter and became an unrestricted grant. Permission binding now returns an unsatisfiable filter when the ordinary filter builder would drop the value. Regression tests reproduced empty-string and empty-array failures before the fix; live null and empty-string checks now deny access.
- Cross-process database admission previously rejected brief background-query bursts immediately. It now retries admission within the existing 250ms admission window, releasing the transaction and connection between attempts. Work is never retried after it starts. Concurrency and SQL timeouts are unchanged. PostgreSQL tests verify short external contention, saturation, cancellation, rollback, and single execution. A separate immediate post-restart attempt hit the existing bounded connection-checkout limit; the completed run started after the app was ready. This is not a new cold-start or scale acceptance claim.

Verification: shared filter tests (45 suites, 709 tests), frontend permission/filter tests (4 suites, 30 tests), permission unit tests (8 suites, 44 tests), and live PostgreSQL query-budget tests (1 suite, 9 tests) passed. Direct shared/server/frontend type checks and changed-file type-aware lint passed. Results and fixture IDs are in `.codex/permissions-rework/product/qa-city-rls-results.json` and `city-rls-fixtures.json`; browser screenshots confirm the saved `Address / City Is Me / City` condition and Tim's City column.
