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
const STANDARD_APPLICATION_ID = 'standard-application-id';
const APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER =
  'a3a0f7c2-5f8e-4f0e-9d7b-3c1d2e4f5a6b';
const OTHER_APPLICATION_ID = 'other-application-id';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  'c6b5a4f3-2e1d-4c0b-9a8f-7e6d5c4b3a2f';
const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7d3c4b2a-1e0f-4a9b-8c7d-6e5f4a3b2c1d';

const buildFlatPermissionFlag = (
  overrides: Pick<FlatPermissionFlag, 'id' | 'universalIdentifier' | 'key'> &
    Partial<FlatPermissionFlag>,
): FlatPermissionFlag => ({
  workspaceId: WORKSPACE_ID,
  applicationId: STANDARD_APPLICATION_ID,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  label: 'Permission flag',
  description: null,
  icon: null,
  permissionType: 'settings',
  rolePermissionFlagIds: [],
  rolePermissionFlagUniversalIdentifiers: [],
  createdAt: '2026-05-13T00:00:00.000Z',
  updatedAt: '2026-05-13T00:00:00.000Z',
  ...overrides,
});

const STANDARD_APPLICATIONS_PERMISSION_FLAG = buildFlatPermissionFlag({
  id: 'applications-flag-id',
  universalIdentifier: SystemPermissionFlag.APPLICATIONS,
  key: 'WORKSPACE_APPS',
});

const STANDARD_CONNECTED_ACCOUNTS_PERMISSION_FLAG = buildFlatPermissionFlag({
  id: 'connected-accounts-flag-id',
  universalIdentifier: SystemPermissionFlag.CONNECTED_ACCOUNTS,
  key: PermissionFlagType.CONNECTED_ACCOUNTS,
});

const APP_PERMISSION_FLAG = buildFlatPermissionFlag({
  id: 'app-flag-id',
  universalIdentifier: APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  applicationId: OTHER_APPLICATION_ID,
  applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
  key: 'CAN_EXPORT_INVOICES',
});

const buildService = ({
  permissionFlags = [
    STANDARD_APPLICATIONS_PERMISSION_FLAG,
    STANDARD_CONNECTED_ACCOUNTS_PERMISSION_FLAG,
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
  const findManyInstalledFlatApplications = jest
    .fn()
    .mockResolvedValue([
      { id: OTHER_APPLICATION_ID, name: 'Invoice Exporter' },
    ]);

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
      findManyInstalledFlatApplications,
    } as unknown as ApplicationService,
  );

  return {
    service,
    validateBuildAndRunWorkspaceMigration,
    findManyInstalledFlatApplications,
  };
};

const getRolePermissionFlagOperation = (
  validateBuildAndRunWorkspaceMigration: jest.Mock,
): {
  flatEntityToCreate: { permissionFlagUniversalIdentifier: string }[];
  flatEntityToDelete: { permissionFlagUniversalIdentifier: string }[];
} =>
  validateBuildAndRunWorkspaceMigration.mock.calls[0][0]
    .allFlatEntityOperationByMetadataName.rolePermissionFlag;

const getCreatedPermissionFlagUniversalIdentifiers = (
  validateBuildAndRunWorkspaceMigration: jest.Mock,
): string[] =>
  getRolePermissionFlagOperation(
    validateBuildAndRunWorkspaceMigration,
  ).flatEntityToCreate.map(
    ({ permissionFlagUniversalIdentifier }) =>
      permissionFlagUniversalIdentifier,
  );

const getDeletedPermissionFlagUniversalIdentifiers = (
  validateBuildAndRunWorkspaceMigration: jest.Mock,
): string[] =>
  getRolePermissionFlagOperation(
    validateBuildAndRunWorkspaceMigration,
  ).flatEntityToDelete.map(
    ({ permissionFlagUniversalIdentifier }) =>
      permissionFlagUniversalIdentifier,
  );

describe('RolePermissionFlagService.upsertPermissionFlags', () => {
  it('resolves an app-defined key by its stored key', async () => {
    const {
      service,
      validateBuildAndRunWorkspaceMigration,
      findManyInstalledFlatApplications,
    } = buildService();

    await service.upsertPermissionFlags({
      workspaceId: WORKSPACE_ID,
      input: { roleId: ROLE_ID, permissionFlagKeys: ['CAN_EXPORT_INVOICES'] },
    });

    expect(
      getCreatedPermissionFlagUniversalIdentifiers(
        validateBuildAndRunWorkspaceMigration,
      ),
    ).toEqual([APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER]);
    expect(findManyInstalledFlatApplications).not.toHaveBeenCalled();
  });

  it('rejects an unknown key naming the key that was sent', async () => {
    const { service, validateBuildAndRunWorkspaceMigration } = buildService();

    await expect(
      service.upsertPermissionFlags({
        workspaceId: WORKSPACE_ID,
        input: { roleId: ROLE_ID, permissionFlagKeys: ['CAN_DELETE_INVOICES'] },
      }),
    ).rejects.toMatchObject({
      code: PermissionsExceptionCode.INVALID_SETTING,
      message: expect.stringMatching(/: CAN_DELETE_INVOICES$/),
    });
    expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('grants each flag once when a key is sent twice', async () => {
    const { service, validateBuildAndRunWorkspaceMigration } = buildService();

    await service.upsertPermissionFlags({
      workspaceId: WORKSPACE_ID,
      input: {
        roleId: ROLE_ID,
        permissionFlagKeys: [
          PermissionFlagType.APPLICATIONS,
          'CAN_EXPORT_INVOICES',
          PermissionFlagType.APPLICATIONS,
          PermissionFlagType.CONNECTED_ACCOUNTS,
          'CAN_EXPORT_INVOICES',
        ],
      },
    });

    expect(
      getCreatedPermissionFlagUniversalIdentifiers(
        validateBuildAndRunWorkspaceMigration,
      ),
    ).toEqual([
      SystemPermissionFlag.APPLICATIONS,
      APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      SystemPermissionFlag.CONNECTED_ACCOUNTS,
    ]);
  });

  describe('upgrade:2-53:rename-app-permission-flag-keys', () => {
    it('resolves a standard key by universal identifier while the stored key differs', async () => {
      const { service, validateBuildAndRunWorkspaceMigration } = buildService();

      await service.upsertPermissionFlags({
        workspaceId: WORKSPACE_ID,
        input: {
          roleId: ROLE_ID,
          permissionFlagKeys: [PermissionFlagType.APPLICATIONS],
        },
      });

      expect(
        getCreatedPermissionFlagUniversalIdentifiers(
          validateBuildAndRunWorkspaceMigration,
        ),
      ).toEqual([SystemPermissionFlag.APPLICATIONS]);
    });

    it('keeps a granted standard flag whose stored key differs', async () => {
      const { service, validateBuildAndRunWorkspaceMigration } = buildService({
        grantedPermissionFlagUniversalIdentifiers: [
          SystemPermissionFlag.APPLICATIONS,
        ],
      });

      const rolePermissionFlags = await service.upsertPermissionFlags({
        workspaceId: WORKSPACE_ID,
        input: {
          roleId: ROLE_ID,
          permissionFlagKeys: [PermissionFlagType.APPLICATIONS],
        },
      });

      expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
      expect(
        rolePermissionFlags.map(
          ({ permissionFlagUniversalIdentifier }) =>
            permissionFlagUniversalIdentifier,
        ),
      ).toEqual([SystemPermissionFlag.APPLICATIONS]);
    });

    describe('when an app flag stores the key a standard flag resolves to', () => {
      const buildCollidingService = () =>
        buildService({
          permissionFlags: [
            STANDARD_APPLICATIONS_PERMISSION_FLAG,
            STANDARD_CONNECTED_ACCOUNTS_PERMISSION_FLAG,
            { ...APP_PERMISSION_FLAG, key: PermissionFlagType.APPLICATIONS },
          ],
          grantedPermissionFlagUniversalIdentifiers: [
            APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
          ],
        });

      it('rejects a request for the key naming the key and the application', async () => {
        const { service, validateBuildAndRunWorkspaceMigration } =
          buildCollidingService();

        await expect(
          service.upsertPermissionFlags({
            workspaceId: WORKSPACE_ID,
            input: {
              roleId: ROLE_ID,
              permissionFlagKeys: [PermissionFlagType.APPLICATIONS],
            },
          }),
        ).rejects.toMatchObject({
          code: PermissionsExceptionCode.INVALID_SETTING,
          message: expect.stringContaining('APPLICATIONS (Invoice Exporter)'),
        });
        expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
      });

      it('revokes the app flag when the role no longer requests the key', async () => {
        const { service, validateBuildAndRunWorkspaceMigration } =
          buildCollidingService();

        await service.upsertPermissionFlags({
          workspaceId: WORKSPACE_ID,
          input: { roleId: ROLE_ID, permissionFlagKeys: [] },
        });

        expect(
          getCreatedPermissionFlagUniversalIdentifiers(
            validateBuildAndRunWorkspaceMigration,
          ),
        ).toEqual([]);
        expect(
          getDeletedPermissionFlagUniversalIdentifiers(
            validateBuildAndRunWorkspaceMigration,
          ),
        ).toEqual([APP_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER]);
      });

      it('grants an unrelated key', async () => {
        const { service, validateBuildAndRunWorkspaceMigration } =
          buildCollidingService();

        await service.upsertPermissionFlags({
          workspaceId: WORKSPACE_ID,
          input: {
            roleId: ROLE_ID,
            permissionFlagKeys: [PermissionFlagType.CONNECTED_ACCOUNTS],
          },
        });

        expect(
          getCreatedPermissionFlagUniversalIdentifiers(
            validateBuildAndRunWorkspaceMigration,
          ),
        ).toEqual([SystemPermissionFlag.CONNECTED_ACCOUNTS]);
      });
    });
  });
});
