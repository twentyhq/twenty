import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import {
  PROPEL_ROLE_LABEL_TIER_MAP,
  PROPEL_ROLE_UID_TIER_MAP,
  type PropelTier,
} from 'src/modules/propel-rls/propel-tier.service';

// ── Propel role-scoped navigation ─────────────────────────────────────────────
// Twenty has no native per-role navigation visibility (nav items are workspace-
// wide or per-user favorites), so manager-only items are filtered out of the
// `navigationMenuItems` read path here, by the requesting user's Twenty role —
// the same single axis propel-rls derives record visibility from.
//
// Manager-only nav items, keyed by the nav item's OWN universalIdentifier as
// declared in the Propel app manifest (propel-crm src/navigation/*.navigation.ts
// via the NAV block of src/shared/identifiers.ts). Stable across installs by
// design — add future manager-only pages here.
export const PROPEL_MANAGER_ONLY_NAV_ITEM_UIDS: ReadonlySet<string> = new Set([
  // "Phone Numbers" — the manager number hub (NAV.numberHubPage)
  '1c000000-0000-4000-8000-0000000000ab',
]);

const HIDE_NOTHING: ReadonlySet<string> = new Set();

@Injectable()
export class PropelNavFilterService {
  private readonly logger = new Logger(PropelNavFilterService.name);

  constructor(private readonly userRoleService: UserRoleService) {}

  // The universalIdentifiers of nav items the requester must NOT receive.
  //
  // COSMETIC filter, deliberately FAIL-OPEN on errors — the opposite of
  // propel-rls's fail-closed data posture, on purpose: every manager-only page
  // is independently role-gated by its routes server-side, so the worst case of
  // showing the item is an agent landing on a forbidden message, while wrongly
  // hiding it would blank part of a manager's sidebar on a transient role-read
  // failure. A successfully RESOLVED non-manager role does hide (that is the
  // feature); only resolution FAILURES show.
  async hiddenNavItemUids({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<ReadonlySet<string>> {
    // Non-user contexts (API keys, integrations) see the full list.
    if (!isDefined(userWorkspaceId)) {
      return HIDE_NOTHING;
    }

    try {
      const rolesMap = await this.userRoleService.getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspaceId],
        workspaceId,
      });
      const roles = rolesMap.get(userWorkspaceId) ?? [];

      return this.topTier(roles) === 'MANAGER'
        ? HIDE_NOTHING
        : PROPEL_MANAGER_ONLY_NAV_ITEM_UIDS;
    } catch (error) {
      this.logger.warn(
        `Propel nav filter failed; hiding nothing. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return HIDE_NOTHING;
    }
  }

  // Same classification as PropelTierService.resolveTier (Admin by standard-role
  // uid; app roles by uid first, label fallback; everything else AGENT), minus
  // the workspace-context dependency that resolver path needs.
  private topTier(
    roles: { label: string; universalIdentifier?: string | null }[],
  ): PropelTier {
    for (const role of roles) {
      if (
        role.universalIdentifier === STANDARD_ROLE.admin.universalIdentifier
      ) {
        return 'MANAGER';
      }

      const tier =
        (isDefined(role.universalIdentifier)
          ? PROPEL_ROLE_UID_TIER_MAP[role.universalIdentifier]
          : undefined) ?? PROPEL_ROLE_LABEL_TIER_MAP[role.label];

      if (tier === 'MANAGER') {
        return 'MANAGER';
      }
    }

    return 'AGENT';
  }
}
