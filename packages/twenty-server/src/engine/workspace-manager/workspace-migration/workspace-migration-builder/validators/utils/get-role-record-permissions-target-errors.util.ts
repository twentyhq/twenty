import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { getRoleNotEditableErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-role-not-editable-errors.util';
import { isWorkspaceEditingAdminRecordPermissions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-workspace-editing-admin-record-permissions.util';
import { validateRoleBelongsToCallerApplication } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-role-belongs-to-caller-application.util';

export const getRoleRecordPermissionsTargetErrors = ({
  flatRole,
  buildOptions,
  shouldCheckRoleApplication = true,
}: {
  flatRole: UniversalFlatRole;
  buildOptions: WorkspaceMigrationValidationBuildOptions;
  shouldCheckRoleApplication?: boolean;
}): FlatEntityValidationError[] => {
  if (isWorkspaceEditingAdminRecordPermissions({ flatRole, buildOptions })) {
    return [];
  }

  return [
    ...(shouldCheckRoleApplication
      ? validateRoleBelongsToCallerApplication({
          referencedRole: flatRole,
          buildOptions,
        })
      : []),
    ...getRoleNotEditableErrors({ flatRole, buildOptions }),
  ];
};
