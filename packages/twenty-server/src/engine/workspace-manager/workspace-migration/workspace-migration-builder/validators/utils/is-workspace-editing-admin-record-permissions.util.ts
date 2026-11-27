import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

export const isWorkspaceEditingAdminRecordPermissions = ({
  flatRole,
  buildOptions,
}: {
  flatRole: Pick<UniversalFlatRole, 'universalIdentifier'>;
  buildOptions: Pick<
    WorkspaceMigrationValidationBuildOptions,
    | 'applicationUniversalIdentifier'
    | 'workspaceCustomApplicationUniversalIdentifier'
  >;
}): boolean =>
  flatRole.universalIdentifier === STANDARD_ROLE.admin.universalIdentifier &&
  buildOptions.applicationUniversalIdentifier ===
    buildOptions.workspaceCustomApplicationUniversalIdentifier;
