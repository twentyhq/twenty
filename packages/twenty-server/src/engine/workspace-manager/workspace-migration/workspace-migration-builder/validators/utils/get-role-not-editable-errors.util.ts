import { msg } from '@lingui/core/macro';

import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import {
  type WorkspaceMigrationBuilderOptions,
  type WorkspaceMigrationValidationBuildOptions,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { isWorkspaceEditingAdminRecordPermissions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-workspace-editing-admin-record-permissions.util';

export const getRoleNotEditableErrors = ({
  flatRole,
  buildOptions,
  isRecordPermissionsChange = false,
}: {
  flatRole: UniversalFlatRole;
  buildOptions: Pick<WorkspaceMigrationBuilderOptions, 'isSystemBuild' | 'applicationUniversalIdentifier'> &
    Partial<
      Pick<
        WorkspaceMigrationValidationBuildOptions,
        'workspaceCustomApplicationUniversalIdentifier'
      >
    >;
  isRecordPermissionsChange?: boolean;
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (
    isRecordPermissionsChange &&
    isWorkspaceEditingAdminRecordPermissions({ flatRole, buildOptions })
  ) {
    return errors;
  }

  if (
    !buildOptions.isSystemBuild &&
    (!flatRole.isEditable || flatRole.isSystemSideEffect)
  ) {
    errors.push({
      code: PermissionsExceptionCode.ROLE_NOT_EDITABLE,
      message: PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
      userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
    });
  }

  return errors;
};
