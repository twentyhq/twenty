import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { isWorkspaceEditingAdminRecordPermissions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-workspace-editing-admin-record-permissions.util';

const ROLE_WIDE_RECORD_PERMISSION_KEYS: string[] = [
  'canReadAllObjectRecords',
  'canCreateAllObjectRecords',
  'canUpdateAllObjectRecords',
  'canSoftDeleteAllObjectRecords',
  'canDestroyAllObjectRecords',
  'updatedAt',
] satisfies (keyof UniversalFlatRole)[];

export const isAdminRoleWideRecordPermissionsUpdate = ({
  flatRole,
  flatEntityUpdate,
  buildOptions,
}: {
  flatRole: UniversalFlatRole;
  flatEntityUpdate: Partial<UniversalFlatRole>;
  buildOptions: WorkspaceMigrationValidationBuildOptions;
}): boolean =>
  isWorkspaceEditingAdminRecordPermissions({ flatRole, buildOptions }) &&
  Object.keys(flatEntityUpdate).every((key) =>
    ROLE_WIDE_RECORD_PERMISSION_KEYS.includes(key),
  );
