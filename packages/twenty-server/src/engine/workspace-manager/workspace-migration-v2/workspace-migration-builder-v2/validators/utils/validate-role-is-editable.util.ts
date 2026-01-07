import { msg } from '@lingui/core/macro';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export const validateRoleIsEditable = ({
  flatRole,
  buildOptions,
}: {
  flatRole: FlatRole;
  buildOptions: WorkspaceMigrationBuilderOptions;
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (!buildOptions.isSystemBuild && !flatRole.isEditable) {
    errors.push({
      code: PermissionsExceptionCode.ROLE_NOT_EDITABLE,
      message: PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
      userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
    });
  }

  return errors;
};
