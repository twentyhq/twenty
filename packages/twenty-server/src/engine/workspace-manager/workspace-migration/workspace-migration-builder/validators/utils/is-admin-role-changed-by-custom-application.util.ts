import { ADMIN_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/role/constants/admin-role-universal-identifier.constant';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

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
  flatRole.universalIdentifier === ADMIN_ROLE_UNIVERSAL_IDENTIFIER &&
  buildOptions.applicationUniversalIdentifier ===
    buildOptions.workspaceCustomApplicationUniversalIdentifier;
