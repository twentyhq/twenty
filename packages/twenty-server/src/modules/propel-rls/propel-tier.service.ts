import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type TierFilterOptions } from 'src/modules/propel-rls/build-tier-filter.util';

// ── Propel clean-room RLS — tier resolution from Twenty ROLE ─────────────────
// The tier is derived from the requesting user's Twenty role, NOT from the
// (now removed) workspaceMember.propelTier custom field.
//
//   MANAGER → sees all rows + bypasses the §8.3 stage gate (override).
//   AGENT   → sees only own rows (ownerField == self) + subject to the gate.
//
// CITERRA has been dropped entirely: RCBI was merged into the normal pipelines,
// so there is no separate Citerra role anymore.
//
// FAIL CLOSED: a real user context must NEVER resolve to MANAGER by accident.
// Only Admin (matched by the stable standard-role universalIdentifier) and the
// custom "Manager" role (matched by label) get MANAGER. Everything else — Agent,
// Member, an unknown role, an empty userWorkspaceRoleMap, a lookup miss, or ANY
// thrown error — buckets to AGENT (own rows only). Non-user contexts are handled
// by the callers (they get the see-all filter / gate bypass, not a tier).

export type PropelTier = 'MANAGER' | 'AGENT';

// The custom-role LABELS below are load-bearing: the workspace's custom roles
// MUST be named exactly "Manager" and "Agent" for tier resolution to work.
// Renaming a role in Twenty settings without updating this map silently demotes
// everyone in that role to AGENT (fail-closed). Admin is matched by its stable
// standard-role universalIdentifier instead, so it is rename-safe.
export const PROPEL_ROLE_LABEL_TIER_MAP: Record<string, PropelTier> = {
  Manager: 'MANAGER',
  Agent: 'AGENT',
  // Twenty's built-in "Member" role → AGENT (own rows only).
  Member: 'AGENT',
};

@Injectable()
export class PropelTierService {
  private readonly logger = new Logger(PropelTierService.name);

  constructor(private readonly roleService: RoleService) {}

  // Resolves the propel tier for a user auth context. ALWAYS returns a concrete
  // tier; never throws. Non-user contexts should not reach here (callers short
  // circuit them) — if one does, we fail closed to AGENT.
  async resolveTier(authContext: WorkspaceAuthContext): Promise<PropelTier> {
    if (authContext.type !== 'user') {
      // Defensive: non-user contexts are handled by callers; never see-all here.
      return 'AGENT';
    }

    try {
      const workspaceId = authContext.workspace.id;
      const { userWorkspaceRoleMap } = getWorkspaceContext();

      const roleId = userWorkspaceRoleMap[authContext.userWorkspaceId];

      if (!isDefined(roleId)) {
        // No role assigned / empty map → fail closed.
        return 'AGENT';
      }

      const role = await this.roleService.getRoleById(roleId, workspaceId);

      if (!isDefined(role)) {
        // Lookup miss → fail closed.
        return 'AGENT';
      }

      // Admin: match by the stable standard-role universalIdentifier (rename-safe).
      if (role.universalIdentifier === STANDARD_ROLE.admin.universalIdentifier) {
        return 'MANAGER';
      }

      // Custom roles (Manager / Agent / Member): match by label.
      return PROPEL_ROLE_LABEL_TIER_MAP[role.label] ?? 'AGENT';
    } catch (error) {
      // ANY error → fail closed to AGENT (own rows only).
      this.logger.warn(
        `Propel tier resolution failed; defaulting to AGENT. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return 'AGENT';
    }
  }

  // Builds the per-tier row filter for the RLS read-path hooks.
  //   non-user context        → null (integrations unfiltered)
  //   MANAGER (Admin/Manager)  → null (sees all)
  //   AGENT (everything else)  → ownerId == requesting member (own rows)
  // Fail-closed: if anything is off, resolveTier() returns AGENT, so a user
  // never gets the null (see-all) filter by accident.
  async buildTierFilter(
    authContext: WorkspaceAuthContext,
    options: TierFilterOptions = {},
  ): Promise<Record<string, unknown> | null> {
    if (authContext.type !== 'user') return null;

    const tier = await this.resolveTier(authContext);

    if (tier === 'MANAGER') return null;

    // AGENT (default / fail-closed): scope to own rows.
    const hasOwner = options.hasOwner ?? true;

    if (!hasOwner) return null;

    const memberId = authContext.workspaceMemberId;

    if (!memberId) return null;

    return { ownerId: { eq: memberId } };
  }

  // Whether RLS-style bypass applies for the §8.3 stage gate:
  // non-user contexts and MANAGER tier bypass the gate (override).
  async gateBypasses(authContext: WorkspaceAuthContext): Promise<boolean> {
    if (authContext.type !== 'user') return true;

    return (await this.resolveTier(authContext)) === 'MANAGER';
  }
}
