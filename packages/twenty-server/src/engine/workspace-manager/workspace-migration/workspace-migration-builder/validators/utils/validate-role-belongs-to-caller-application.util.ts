import { msg, t } from '@lingui/core/macro';

import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export const validateRoleBelongsToCallerApplication = ({
  referencedRole,
  buildOptions,
}: {
  referencedRole: UniversalFlatRole;
  buildOptions: WorkspaceMigrationBuilderOptions;
}): FlatEntityValidationError[] => {
  if (
    referencedRole.applicationUniversalIdentifier !==
    buildOptions.applicationUniversalIdentifier
  ) {
    return [
      {
        code: PermissionsExceptionCode.ROLE_BELONGS_TO_ANOTHER_APPLICATION,
        message: t`Cannot modify permissions on a role owned by another application`,
        userFriendlyMessage: msg`Cannot modify permissions on a role owned by another application.`,
      },
    ];
  }

  return [];
};
