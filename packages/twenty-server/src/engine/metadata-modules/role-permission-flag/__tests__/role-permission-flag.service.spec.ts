import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RolePermissionFlagService } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = 'workspace-id';
const ROLE_ID = 'role-id';
const ROLE_UNIVERSAL_IDENTIFIER = '4b1f1c0e-62d6-4a43-9a3c-2a4f0e6f3c11';
const APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER =
  'a3a0f7c2-5f8e-4f0e-9d7b-3c1d2e4f5a6b';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  'c6b5a4f3-2e1d-4c0b-9a8f-7e6d5c4b3a2f';
const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7d3c4b2a-1e0f-4a9b-8c7d-6e5f4a3b2c1d';

const STANDARD_WORKSPACE_APPS_PERMISSION_FLAG = {
  id: 'workspace-apps-flag-id',
  universalIdentifier: SystemPermissionFlag.WORKSPACE_APPS,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  key: 'APPLICATIONS',
} as FlatPermissionFlag;

const STANDARD_USER_APPS_PERMISSION_FLAG = {
  id: 'user-apps-flag-id',
  universalIdentifier: SystemPermissionFlag.USER_APPS,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  key: PermissionFlagType.USER_APPS,
} as FlatPermissionFlag;

const APP_PERMISSION_FLAG = {
  id: 'app-flag-id',
  universalIdentifier: APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
  key: 'CAN_EXPORT_INVOICES',
} as FlatPermissionFlag;

const buildService = ({
  permissionFlags = [
    STANDARD_WORKSPACE_APPS_PERMISSION_FLAG,
    STANDARD_USER_APPS_PERMISSION_FLAG,
    APP_PERMISSION_FLAG,
  ],
  grantedPermissionFlagUniversalIdentifiers = [],
}: {
  permissionFlags?: FlatPermissionFlag[];
  grantedPermissionFlagUniversalIdentifiers?: string[];
} = {}) => {
  const flatPermissionFlagMaps = {
    byUniversalIdentifier: Object.fromEntries(
      permissionFlags.map((permissionFlag) => [
        permissionFlag.universalIdentifier,
        permissionFlag,
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      permissionFlags.map((permissionFlag) => [
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
  const flatRolePermissionFlagMaps = {
    byUniversalIdentifier: Object.fromEntries(
      grantedPermissionFlagUniversalIdentifiers.map(
        (permissionFlagUniversalIdentifier) => [
          `granted-${permissionFlagUniversalIdentifier}`,
          {
            universalIdentifier: `granted-${permissionFlagUniversalIdentifier}`,
            roleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
            permissionFlagUniversalIdentifier,
          },
        ],
      ),
    ),
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
        flatRolePermissionFlagMaps,
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

  it.each([
    ['APPLICATIONS', SystemPermissionFlag.WORKSPACE_APPS],
    ['CONNECTED_ACCOUNTS', SystemPermissionFlag.USER_APPS],
  ])(
    'grants the standard flag for its previous key %s',
    async (previousKey, expectedUniversalIdentifier) => {
      const { service, validateBuildAndRunWorkspaceMigration } = buildService();

      await service.upsertPermissionFlags({
        workspaceId: WORKSPACE_ID,
        input: { roleId: ROLE_ID, permissionFlagKeys: [previousKey] },
      });

      expect(
        getCreatedPermissionFlagUniversalIdentifiers(
          validateBuildAndRunWorkspaceMigration,
        ),
      ).toEqual([expectedUniversalIdentifier]);
    },
  );

  it('grants each standard flag once when both of its keys are sent next to an app flag', async () => {
    const { service, validateBuildAndRunWorkspaceMigration } = buildService();

    await service.upsertPermissionFlags({
      workspaceId: WORKSPACE_ID,
      input: {
        roleId: ROLE_ID,
        permissionFlagKeys: [
          'APPLICATIONS',
          PermissionFlagType.WORKSPACE_APPS,
          'CAN_EXPORT_INVOICES',
          PermissionFlagType.USER_APPS,
          'CONNECTED_ACCOUNTS',
        ],
      },
    });

    expect(
      getCreatedPermissionFlagUniversalIdentifiers(
        validateBuildAndRunWorkspaceMigration,
      ),
    ).toEqual([
      SystemPermissionFlag.WORKSPACE_APPS,
      APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      SystemPermissionFlag.USER_APPS,
    ]);
  });

  it('keeps a granted standard flag when the role is saved with its previous key', async () => {
    const { service, validateBuildAndRunWorkspaceMigration } = buildService({
      grantedPermissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.WORKSPACE_APPS,
      ],
    });

    const rolePermissionFlags = await service.upsertPermissionFlags({
      workspaceId: WORKSPACE_ID,
      input: { roleId: ROLE_ID, permissionFlagKeys: ['APPLICATIONS'] },
    });

    expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
    expect(
      rolePermissionFlags.map(
        ({ permissionFlagUniversalIdentifier }) =>
          permissionFlagUniversalIdentifier,
      ),
    ).toEqual([SystemPermissionFlag.WORKSPACE_APPS]);
  });

  it('rejects an unknown key', async () => {
    const { service, validateBuildAndRunWorkspaceMigration } = buildService();

    await expect(
      service.upsertPermissionFlags({
        workspaceId: WORKSPACE_ID,
        input: { roleId: ROLE_ID, permissionFlagKeys: ['CAN_DELETE_INVOICES'] },
      }),
    ).rejects.toMatchObject({ code: PermissionsExceptionCode.INVALID_SETTING });
    expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
  });

  it.each(['before', 'after'])(
    'grants the standard flag when an app flag listed %s it holds the same resolved key',
    async (appFlagPosition) => {
      const appPermissionFlagHoldingStandardKey = {
        ...APP_PERMISSION_FLAG,
        key: PermissionFlagType.WORKSPACE_APPS,
      };
      const { service, validateBuildAndRunWorkspaceMigration } = buildService({
        permissionFlags:
          appFlagPosition === 'before'
            ? [
                appPermissionFlagHoldingStandardKey,
                STANDARD_WORKSPACE_APPS_PERMISSION_FLAG,
              ]
            : [
                STANDARD_WORKSPACE_APPS_PERMISSION_FLAG,
                appPermissionFlagHoldingStandardKey,
              ],
      });

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
    },
  );
});
