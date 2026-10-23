import { type ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/core-modules/application/constants/workspace-custom-application-role.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { buildWorkspaceCustomApplicationFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-workspace-custom-application-flat-role.util';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = 'workspace-id';

const workspaceCustomFlatApplication = {
  id: 'workspace-custom-application-id',
  universalIdentifier: 'workspace-custom-application-id',
  defaultRoleId: null,
} as FlatApplication;

const existingFlatRole = buildWorkspaceCustomApplicationFlatRole({
  workspaceId: WORKSPACE_ID,
  workspaceCustomFlatApplication,
});

const buildRoleService = ({
  hasExistingRole,
}: {
  hasExistingRole: boolean;
}) => {
  const validateBuildAndRunWorkspaceMigration = jest
    .fn()
    .mockResolvedValue({ status: 'success' });
  const updateApplication = jest.fn().mockResolvedValue(undefined);
  const flatRoleMaps = hasExistingRole
    ? addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: existingFlatRole,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      })
    : createEmptyFlatEntityMaps();

  const roleService = new RoleService(
    {
      validateBuildAndRunWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    {
      getOrRecomputeManyOrAllFlatEntityMaps: jest
        .fn()
        .mockResolvedValue({ flatRoleMaps }),
    } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
    {} as never,
    { update: updateApplication } as unknown as ApplicationService,
    {} as ApiKeyRoleService,
  );

  return {
    roleService,
    validateBuildAndRunWorkspaceMigration,
    updateApplication,
  };
};

describe('RoleService.createWorkspaceCustomApplicationRole', () => {
  it('creates the role and sets it as the custom application default role', async () => {
    const {
      roleService,
      validateBuildAndRunWorkspaceMigration,
      updateApplication,
    } = buildRoleService({ hasExistingRole: false });

    await roleService.createWorkspaceCustomApplicationRole({
      workspaceId: WORKSPACE_ID,
      workspaceCustomFlatApplication,
    });

    const [[{ allFlatEntityOperationByMetadataName }]] =
      validateBuildAndRunWorkspaceMigration.mock.calls;
    const [createdFlatRole] =
      allFlatEntityOperationByMetadataName.role.flatEntityToCreate;

    expect(createdFlatRole.universalIdentifier).toBe(
      WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    );
    expect(updateApplication).toHaveBeenCalledWith(
      workspaceCustomFlatApplication.id,
      { workspaceId: WORKSPACE_ID, defaultRoleId: createdFlatRole.id },
    );
  });

  it('reuses the role a failed activation already created', async () => {
    const {
      roleService,
      validateBuildAndRunWorkspaceMigration,
      updateApplication,
    } = buildRoleService({ hasExistingRole: true });

    await roleService.createWorkspaceCustomApplicationRole({
      workspaceId: WORKSPACE_ID,
      workspaceCustomFlatApplication,
    });

    expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
    expect(updateApplication).toHaveBeenCalledWith(
      workspaceCustomFlatApplication.id,
      { workspaceId: WORKSPACE_ID, defaultRoleId: existingFlatRole.id },
    );
  });

  it('changes nothing once the role is the custom application default role', async () => {
    const {
      roleService,
      validateBuildAndRunWorkspaceMigration,
      updateApplication,
    } = buildRoleService({ hasExistingRole: true });

    await roleService.createWorkspaceCustomApplicationRole({
      workspaceId: WORKSPACE_ID,
      workspaceCustomFlatApplication: {
        ...workspaceCustomFlatApplication,
        defaultRoleId: existingFlatRole.id,
      },
    });

    expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
    expect(updateApplication).not.toHaveBeenCalled();
  });
});
