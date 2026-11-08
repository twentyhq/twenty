import { msg, t } from '@lingui/core/macro';
import { getApplicationGrantRoleUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

// Grant identifiers derive from public application identifiers, so only a grant write may use one
export const validateRoleDoesNotTakeApplicationGrantUniversalIdentifier = ({
  flatRole,
  buildOptions: {
    isSystemBuild,
    applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    flatApplicationMaps,
  },
}: {
  flatRole: Pick<UniversalFlatRole, 'universalIdentifier'>;
  buildOptions: WorkspaceMigrationValidationBuildOptions;
}): FlatEntityValidationError[] => {
  if (
    isSystemBuild &&
    applicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier
  ) {
    return [];
  }

  const takesApplicationGrantUniversalIdentifier = Object.values(
    flatApplicationMaps.byId,
  ).some(
    (flatApplication) =>
      isDefined(flatApplication) &&
      getApplicationGrantRoleUniversalIdentifier({
        grantedApplicationUniversalIdentifier:
          flatApplication.universalIdentifier,
        workspaceCustomApplicationUniversalIdentifier,
      }) === flatRole.universalIdentifier,
  );

  return takesApplicationGrantUniversalIdentifier
    ? [
        {
          code: PermissionsExceptionCode.INVALID_SETTING,
          message: t`Role universal identifier is reserved for an application grant`,
          userFriendlyMessage: msg`This role identifier is reserved`,
        },
      ]
    : [];
};
