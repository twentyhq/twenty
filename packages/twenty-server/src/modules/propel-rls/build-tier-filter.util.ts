// ── Propel clean-room RLS — shared filter helpers ────────────────────────────
// The per-tier row filter is now built by PropelTierService.buildTierFilter
// (tier is resolved from the user's Twenty ROLE, see propel-tier.service.ts).
// This file keeps only the pure, DI-free helpers shared by every hook.
// NOT derived from Twenty's @license Enterprise RLS.
//
//   MANAGER (Admin / custom "Manager" role) → null (no filter, sees all)
//   AGENT   (everything else, fail-closed)   → ownerId == requesting member (own)
//   non-user contexts (apiKey/application/system) → null (integrations unfiltered)
//
// CITERRA has been removed: RCBI merged into the normal pipelines, so there is
// no separate Citerra role / businessUnit wall anymore.
//
// `options` lets objects opt out of the owner axis if they don't carry ownerId
// (all our isolated objects currently do).

export type TierFilterOptions = {
  hasOwner?: boolean; // object carries ownerId (default true)
};

// Compose the tier filter with any user-supplied filter via AND so scoping can't
// be bypassed. Returns the new payload filter (or the original if no scoping).
export const composeFilter = (
  existing: unknown,
  tierFilter: Record<string, unknown> | null,
): unknown => {
  if (!tierFilter) return existing;
  return existing ? { and: [existing, tierFilter] } : tierFilter;
};

// NOTE on findDuplicates: it is NOT RLS-hooked. It cannot be scoped via a
// @WorkspaceQueryHook (its args are {ids, data} with no filter, and the post-query
// hook returns void). A core patch of common-find-duplicates-query-runner.service.ts
// was explored, but findDuplicates is INERT for our custom objects: it only queries
// when `flatObjectMetadata.duplicateCriteria` is non-empty, and (a) our objects
// define none and (b) the app SDK's ObjectManifest has no way to set duplicateCriteria.
// So there is no reachable leak to scope. If Twenty ever lets the SDK set
// duplicateCriteria on custom objects, revisit: patch the core runner to fold
// the tier filter into duplicateConditions via { and: [...] } for the
// RLS-scoped objects only.
