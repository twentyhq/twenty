import { msg, t } from '@lingui/core/macro';

import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import {
  type WorkspaceMigrationBuilderOptions,
  type WorkspaceMigrationValidationBuildOptions,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { isWorkspaceEditingAdminRecordPermissions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-workspace-editing-admin-record-permissions.util';

export const validateRoleBelongsToCallerApplication = ({
  referencedRole,
  buildOptions,
  isRecordPermissionsChange = false,
}: {
  referencedRole: UniversalFlatRole;
  buildOptions: WorkspaceMigrationBuilderOptions &
    Partial<
      Pick<
        WorkspaceMigrationValidationBuildOptions,
        'workspaceCustomApplicationUniversalIdentifier'
      >
    >;
  isRecordPermissionsChange?: boolean;
}): FlatEntityValidationError[] => {
  if (
    isRecordPermissionsChange &&
    isWorkspaceEditingAdminRecordPermissions({
      flatRole: referencedRole,
      buildOptions,
    })
  ) {
    return [];
  }

  if (
    referencedRole.applicationUniversalIdentifier !==
    buildOptions.applicationUniversalIdentifier
  ) {
    return [
      {
        code: PermissionsExceptionCode.ROLE_BELONGS_TO_ANOTHER_APPLICATION,
        message: t`Cannot target a role owned by another application`,
        userFriendlyMessage: msg`Cannot target a role owned by another application.`,
      },
    ];
  }

  return [];
};
