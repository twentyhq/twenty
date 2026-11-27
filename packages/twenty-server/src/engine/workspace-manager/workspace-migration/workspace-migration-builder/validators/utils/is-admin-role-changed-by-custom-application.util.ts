import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

// TODO(@charlesBochet): temporary Admin record permissions exception, remove once the workspace owns Admin's record permissions
export const isAdminRoleChangedByCustomApplication = ({
  flatRole,
  buildOptions,
}: {
  flatRole: Pick<UniversalFlatRole, 'universalIdentifier'>;
  buildOptions: Pick<
    WorkspaceMigrationValidationBuildOptions,
    'applicationUniversalIdentifier'
  > &
    Partial<
      Pick<
        WorkspaceMigrationValidationBuildOptions,
        'workspaceCustomApplicationUniversalIdentifier'
      >
    >;
}): boolean =>
  flatRole.universalIdentifier === STANDARD_ROLE.admin.universalIdentifier &&
  buildOptions.applicationUniversalIdentifier ===
    buildOptions.workspaceCustomApplicationUniversalIdentifier;
