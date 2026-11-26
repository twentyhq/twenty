import { msg, t } from '@lingui/core/macro';

import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

// Only the manifest sync of a marketplace app sets it, so other builds are unrestricted
const isMarketplaceApplicationBuild = ({
  isSystemBuild,
  isMarketplaceApplication,
}: WorkspaceMigrationValidationBuildOptions): boolean =>
  !isSystemBuild && isMarketplaceApplication === true;

type RoleAssignability = Pick<
  UniversalFlatRole,
  'canBeAssignedToUsers' | 'canBeAssignedToApiKeys'
>;

// Members and API keys must not hold a role an app upgrade can widen. An
// installed role may still update while it moves toward agent-only, so only
// turning a flag on is refused there.
export const getMarketplaceApplicationRoleAssignabilityErrors = ({
  flatRole,
  fromFlatRole,
  buildOptions,
}: {
  flatRole: RoleAssignability;
  fromFlatRole?: RoleAssignability;
  buildOptions: WorkspaceMigrationValidationBuildOptions;
}): FlatEntityValidationError[] => {
  const isFlagRefused = (flag: keyof RoleAssignability) =>
    flatRole[flag] === true && fromFlatRole?.[flag] !== true;

  return (isFlagRefused('canBeAssignedToUsers') ||
    isFlagRefused('canBeAssignedToApiKeys')) &&
    isMarketplaceApplicationBuild(buildOptions)
    ? [
        {
          code: PermissionsExceptionCode.MARKETPLACE_APPLICATION_ROLE_ASSIGNABILITY,
          message: t`A marketplace application role can only be assigned to agents`,
          userFriendlyMessage: msg`A marketplace application role can only be assigned to agents.`,
        },
      ]
    : [];
};

export const getMarketplaceApplicationRoleRestrictionErrors = ({
  buildOptions,
}: {
  buildOptions: WorkspaceMigrationValidationBuildOptions;
}): FlatEntityValidationError[] =>
  isMarketplaceApplicationBuild(buildOptions)
    ? [
        {
          code: PermissionsExceptionCode.MARKETPLACE_APPLICATION_ROLE_RESTRICTION,
          message: t`A marketplace application cannot declare row-level rules or field permissions`,
          userFriendlyMessage: msg`A marketplace application cannot declare row-level rules or field permissions.`,
        },
      ]
    : [];
