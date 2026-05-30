import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

// ── Propel clean-room RLS — shared tier filter ───────────────────────────────
// Single source of truth for the per-tier row filter, used by every per-object
// pre-query hook. NOT derived from Twenty's @license Enterprise RLS.
//
//   MANAGER → null (no filter, sees all)
//   AGENT   → ownerId == requesting member  (sees own)
//   CITERRA → businessUnit == 'CITERRA'      (separate-company wall)
//   non-user contexts (apiKey/application/system) → null (integrations unfiltered)
//
// `options` lets objects opt out of an axis they don't carry (e.g. an object with
// no businessUnit, though all our isolated objects have both).

export type TierFilterOptions = {
  hasOwner?: boolean; // object carries ownerId (default true)
  hasBusinessUnit?: boolean; // object carries businessUnit (default true)
};

export const buildTierFilter = (
  authContext: WorkspaceAuthContext,
  options: TierFilterOptions = {},
): Record<string, unknown> | null => {
  const hasOwner = options.hasOwner ?? true;
  const hasBusinessUnit = options.hasBusinessUnit ?? true;

  if (authContext.type !== 'user') return null;

  const member = authContext.workspaceMember as
    | (Record<string, unknown> & { id?: string })
    | undefined;
  const tier = (member?.propelTier as string | undefined) ?? 'AGENT';

  if (tier === 'MANAGER') return null;

  if (tier === 'CITERRA') {
    return hasBusinessUnit ? { businessUnit: { eq: 'CITERRA' } } : null;
  }

  // AGENT (default)
  if (!hasOwner) return null;
  const memberId = authContext.workspaceMemberId;
  if (!memberId) return null;
  return { ownerId: { eq: memberId } };
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
