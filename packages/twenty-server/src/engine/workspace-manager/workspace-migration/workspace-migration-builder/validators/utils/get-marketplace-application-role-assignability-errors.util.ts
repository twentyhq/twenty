import { msg, t } from '@lingui/core/macro';

import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { isMarketplaceApplicationBuild } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-marketplace-application-build.util';

type RoleAssignability = Pick<
  UniversalFlatRole,
  'canBeAssignedToUsers' | 'canBeAssignedToApiKeys'
>;

// An installed role may keep a flag on, so it can still upgrade toward agent-only
export const getMarketplaceApplicationRoleAssignabilityErrors = ({
  flatRole,
  fromFlatRole,
  buildOptions,
}: {
  flatRole: RoleAssignability;
  fromFlatRole?: RoleAssignability;
  buildOptions: Pick<
    WorkspaceMigrationValidationBuildOptions,
    'isSystemBuild' | 'isMarketplaceApplication'
  >;
}): FlatEntityValidationError[] => {
  const isFlagTurnedOn = (flag: keyof RoleAssignability) =>
    flatRole[flag] && !fromFlatRole?.[flag];

  return (isFlagTurnedOn('canBeAssignedToUsers') ||
    isFlagTurnedOn('canBeAssignedToApiKeys')) &&
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
