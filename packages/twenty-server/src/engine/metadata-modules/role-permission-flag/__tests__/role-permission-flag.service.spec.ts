import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RolePermissionFlagService } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = 'workspace-id';
const ROLE_ID = 'role-id';
const ROLE_UNIVERSAL_IDENTIFIER = '4b1f1c0e-62d6-4a43-9a3c-2a4f0e6f3c11';
const APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER =
  'a3a0f7c2-5f8e-4f0e-9d7b-3c1d2e4f5a6b';
const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7d3c4b2a-1e0f-4a9b-8c7d-6e5f4a3b2c1d';

const buildPermissionFlag = ({
  id,
  universalIdentifier,
  key,
}: {
  id: string;
  universalIdentifier: string;
  key: string;
}) => ({ id, universalIdentifier, key });

// The workspace has not run the 2-53 rename yet, so the standard row keeps its previous key
const PERMISSION_FLAGS = [
  buildPermissionFlag({
    id: 'workspace-apps-flag-id',
    universalIdentifier: SystemPermissionFlag.WORKSPACE_APPS,
    key: 'APPLICATIONS',
  }),
  buildPermissionFlag({
    id: 'app-flag-id',
    universalIdentifier: APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    key: 'CAN_EXPORT_INVOICES',
  }),
];

const buildService = () => {
  const flatPermissionFlagMaps = {
    byUniversalIdentifier: Object.fromEntries(
      PERMISSION_FLAGS.map((permissionFlag) => [
        permissionFlag.universalIdentifier,
        permissionFlag,
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      PERMISSION_FLAGS.map((permissionFlag) => [
        permissionFlag.id,
        permissionFlag.universalIdentifier,
      ]),
    ),
    universalIdentifiersByApplicationId: {},
  };
  const flatRoleMaps = {
    byUniversalIdentifier: {
      [ROLE_UNIVERSAL_IDENTIFIER]: {
        id: ROLE_ID,
        universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
      },
    },
    universalIdentifierById: { [ROLE_ID]: ROLE_UNIVERSAL_IDENTIFIER },
    universalIdentifiersByApplicationId: {},
  };
  const emptyFlatRolePermissionFlagMaps = {
    byUniversalIdentifier: {},
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  };

  const validateBuildAndRunWorkspaceMigration = jest
    .fn()
    .mockResolvedValue({ status: 'success' });

  const service = new RolePermissionFlagService(
    {
      validateBuildAndRunWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
        flatPermissionFlagMaps,
        flatRolePermissionFlagMaps: emptyFlatRolePermissionFlagMaps,
        flatRoleMaps,
      }),
    } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          workspaceCustomFlatApplication: {
            universalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        }),
    } as unknown as ApplicationService,
  );

  return { service, validateBuildAndRunWorkspaceMigration };
};

const getCreatedPermissionFlagUniversalIdentifiers = (
  validateBuildAndRunWorkspaceMigration: jest.Mock,
): string[] =>
  validateBuildAndRunWorkspaceMigration.mock.calls[0][0].allFlatEntityOperationByMetadataName.rolePermissionFlag.flatEntityToCreate.map(
    ({
      permissionFlagUniversalIdentifier,
    }: {
      permissionFlagUniversalIdentifier: string;
    }) => permissionFlagUniversalIdentifier,
  );

describe('RolePermissionFlagService.upsertPermissionFlags', () => {
  it('resolves a standard key by universal identifier while the stored key is the previous one', async () => {
    const { service, validateBuildAndRunWorkspaceMigration } = buildService();

    await service.upsertPermissionFlags({
      workspaceId: WORKSPACE_ID,
      input: {
        roleId: ROLE_ID,
        permissionFlagKeys: [PermissionFlagType.WORKSPACE_APPS],
      },
    });

    expect(
      getCreatedPermissionFlagUniversalIdentifiers(
        validateBuildAndRunWorkspaceMigration,
      ),
    ).toEqual([SystemPermissionFlag.WORKSPACE_APPS]);
  });

  it('resolves an app-defined key by its stored key', async () => {
    const { service, validateBuildAndRunWorkspaceMigration } = buildService();

    await service.upsertPermissionFlags({
      workspaceId: WORKSPACE_ID,
      input: { roleId: ROLE_ID, permissionFlagKeys: ['CAN_EXPORT_INVOICES'] },
    });

    expect(
      getCreatedPermissionFlagUniversalIdentifiers(
        validateBuildAndRunWorkspaceMigration,
      ),
    ).toEqual([APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER]);
  });

  it('rejects the previous key of a renamed standard flag', async () => {
    const { service, validateBuildAndRunWorkspaceMigration } = buildService();

    await expect(
      service.upsertPermissionFlags({
        workspaceId: WORKSPACE_ID,
        input: { roleId: ROLE_ID, permissionFlagKeys: ['APPLICATIONS'] },
      }),
    ).rejects.toMatchObject({ code: PermissionsExceptionCode.INVALID_SETTING });
    expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
  });
});
