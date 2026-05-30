import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

// ── Propel clean-room RLS ────────────────────────────────────────────────────
// AGPL @WorkspaceQueryHook (NOT derived from Twenty's @license Enterprise RLS).
// Injects a row filter on secondaryOpportunity.findMany based on the requesting
// workspace member's `propelTier` custom field:
//   MANAGER → no filter (sees all)
//   AGENT   → ownerId == this member  (sees own)
//   CITERRA → businessUnit == 'CITERRA'  (separate-company wall)
// Non-user contexts (apiKey/application/system) are NOT filtered — integrations
// keep full access. This is the proof-of-concept object; a factory rolls the same
// logic to the other lanes once verified.

const buildTierFilter = (
  authContext: WorkspaceAuthContext,
): Record<string, unknown> | null => {
  // Only user sessions are row-scoped. API keys / apps / system = full access.
  if (authContext.type !== 'user') return null;

  const member = authContext.workspaceMember as
    | (Record<string, unknown> & { id?: string })
    | undefined;
  const tier = (member?.propelTier as string | undefined) ?? 'AGENT';

  if (tier === 'MANAGER') return null; // sees everything
  if (tier === 'CITERRA') return { businessUnit: { eq: 'CITERRA' } };

  // AGENT (default): only records they own
  const memberId = authContext.workspaceMemberId;
  if (!memberId) return null;
  return { ownerId: { eq: memberId } };
};

@WorkspaceQueryHook(`secondaryOpportunity.findMany`)
export class SecondaryOpportunityRlsPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: FindManyResolverArgs,
  ): Promise<FindManyResolverArgs> {
    const tierFilter = buildTierFilter(authContext);

    if (!tierFilter) return payload;

    // Compose with any user-supplied filter via AND so scoping can't be bypassed.
    const existing = payload.filter;
    const combined = existing
      ? { and: [existing, tierFilter] }
      : tierFilter;

    return { ...payload, filter: combined };
  }
}
