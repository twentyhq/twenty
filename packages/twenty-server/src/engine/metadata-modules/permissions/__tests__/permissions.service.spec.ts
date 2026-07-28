import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const buildFlatEntityMaps = <T extends SyncableFlatEntity>(
  entities: T[],
): FlatEntityMaps<T> =>
  entities.reduce(
    (maps, entity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: entity,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<T>,
  );

describe('PermissionsService', () => {
  let service: PermissionsService;
  let roleRepository: { find: jest.Mock };
  let workspaceCacheService: { getOrRecompute: jest.Mock };

  beforeEach(async () => {
    roleRepository = {
      find: jest.fn(),
    };
    workspaceCacheService = {
      getOrRecompute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getWorkspaceScopedRepositoryToken(RoleEntity),
          useValue: roleRepository,
        },
        {
          provide: ApiKeyRoleService,
          useValue: {},
        },
        {
          provide: UserRoleService,
          useValue: {},
        },
        {
          provide: WorkspaceCacheService,
          useValue: workspaceCacheService,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  describe('checkRolePermissions', () => {
    describe('canAccessAllTools for tool permissions', () => {
      it('should grant permission when canAccessAllTools is true for a tool permission', () => {
        const roleWithAllTools: Partial<RoleEntity> = {
          id: 'test-role-id',
          label: 'Test Role',
          description: 'Test role description',
          icon: 'IconTest',
          canAccessAllTools: true,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
          canBeAssignedToAgents: true,
          canBeAssignedToApiKeys: true,
          rolePermissionFlags: [],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        };

        // Test all tool permissions
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.UPLOAD_FILE,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.DOWNLOAD_FILE,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.AI,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.VIEWS,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.SEND_EMAIL_TOOL,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.IMPORT_CSV,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.EXPORT_CSV,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.CONNECTED_ACCOUNTS,
          ),
        ).toBe(true);
      });

      it('should NOT grant settings permissions when canAccessAllTools is true', () => {
        const roleWithAllTools: Partial<RoleEntity> = {
          id: 'test-role-id',
          label: 'Test Role',
          description: 'Test role description',
          icon: 'IconTest',
          canAccessAllTools: true,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
          canBeAssignedToAgents: true,
          canBeAssignedToApiKeys: true,
          rolePermissionFlags: [],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        };

        // Test that settings permissions are NOT granted
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.ROLES,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.WORKSPACE,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.DATA_MODEL,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllTools as RoleEntity,
            PermissionFlagType.SECURITY,
          ),
        ).toBe(false);
      });
    });

    describe('canUpdateAllSettings for settings permissions', () => {
      it('should grant permission when canUpdateAllSettings is true for a settings permission', () => {
        const roleWithAllSettings: Partial<RoleEntity> = {
          id: 'test-role-id',
          label: 'Test Role',
          description: 'Test role description',
          icon: 'IconTest',
          canAccessAllTools: false,
          canUpdateAllSettings: true,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
          canBeAssignedToAgents: true,
          canBeAssignedToApiKeys: true,
          rolePermissionFlags: [],
          roleTargets: [],
          objectPermissions: [],
          fieldPermissions: [],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        };

        // Test all settings permissions
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.ROLES,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.WORKSPACE,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.DATA_MODEL,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.SECURITY,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.WORKFLOWS,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.WORKSPACE_MEMBERS,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.API_KEYS_AND_WEBHOOKS,
          ),
        ).toBe(true);
      });

      it('should NOT grant tool permissions when canUpdateAllSettings is true', () => {
        const roleWithAllSettings: Partial<RoleEntity> = {
          id: 'test-role-id',
          label: 'Test Role',
          description: 'Test role description',
          icon: 'IconTest',
          canAccessAllTools: false,
          canUpdateAllSettings: true,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
          canBeAssignedToAgents: true,
          canBeAssignedToApiKeys: true,
          rolePermissionFlags: [],
          roleTargets: [],
          objectPermissions: [],
          fieldPermissions: [],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        };

        // Test that tool permissions are NOT granted
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.UPLOAD_FILE,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.DOWNLOAD_FILE,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.AI,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings as RoleEntity,
            PermissionFlagType.VIEWS,
          ),
        ).toBe(false);
      });
    });

    describe('Granular permissions with rolePermissionFlags', () => {
      it('should grant specific tool permission when included in rolePermissionFlags even if canAccessAllTools is false', () => {
        const roleWithSpecificPermission: Partial<RoleEntity> = {
          id: 'test-role-id',
          label: 'Test Role',
          description: 'Test role description',
          icon: 'IconTest',
          canAccessAllTools: false,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
          canBeAssignedToAgents: true,
          canBeAssignedToApiKeys: true,
          rolePermissionFlags: [
            {
              id: 'permission-1',
              permissionFlag: {
                key: PermissionFlagType.UPLOAD_FILE,
                universalIdentifier: SystemPermissionFlag.UPLOAD_FILE,
              },
              roleId: 'test-role-id',
              workspaceId: 'test-workspace-id',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ] as any,
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        };

        expect(
          service.checkRolePermissions(
            roleWithSpecificPermission as RoleEntity,
            PermissionFlagType.UPLOAD_FILE,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithSpecificPermission as RoleEntity,
            PermissionFlagType.DOWNLOAD_FILE,
          ),
        ).toBe(false);
      });

      it('should grant specific settings permission when included in rolePermissionFlags even if canUpdateAllSettings is false', () => {
        const roleWithSpecificPermission: Partial<RoleEntity> = {
          id: 'test-role-id',
          label: 'Test Role',
          description: 'Test role description',
          icon: 'IconTest',
          canAccessAllTools: false,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
          canBeAssignedToAgents: true,
          canBeAssignedToApiKeys: true,
          rolePermissionFlags: [
            {
              id: 'permission-1',
              permissionFlag: {
                key: PermissionFlagType.ROLES,
                universalIdentifier: SystemPermissionFlag.ROLES,
              },
              roleId: 'test-role-id',
              workspaceId: 'test-workspace-id',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ] as any,
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        };

        expect(
          service.checkRolePermissions(
            roleWithSpecificPermission as RoleEntity,
            PermissionFlagType.ROLES,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithSpecificPermission as RoleEntity,
            PermissionFlagType.WORKSPACE,
          ),
        ).toBe(false);
      });
    });

    describe('No permissions', () => {
      it('should deny all permissions when neither canAccessAllTools nor canUpdateAllSettings are true and no specific permissions', () => {
        const roleWithNoPermissions: Partial<RoleEntity> = {
          id: 'test-role-id',
          label: 'Test Role',
          description: 'Test role description',
          icon: 'IconTest',
          canAccessAllTools: false,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: true,
          canBeAssignedToAgents: true,
          canBeAssignedToApiKeys: true,
          rolePermissionFlags: [],
          roleTargets: [],
          objectPermissions: [],
          fieldPermissions: [],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        };

        // Tool permissions should be denied
        expect(
          service.checkRolePermissions(
            roleWithNoPermissions as RoleEntity,
            PermissionFlagType.UPLOAD_FILE,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithNoPermissions as RoleEntity,
            PermissionFlagType.AI,
          ),
        ).toBe(false);

        // Settings permissions should be denied
        expect(
          service.checkRolePermissions(
            roleWithNoPermissions as RoleEntity,
            PermissionFlagType.ROLES,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithNoPermissions as RoleEntity,
            PermissionFlagType.WORKSPACE,
          ),
        ).toBe(false);
      });
    });
  });

  describe.each([
    {
      evaluator: 'checkRolesPermissions' as const,
      permissionFlag: PermissionFlagType.DATA_MODEL,
      basePermission: 'canUpdateAllSettings' as const,
    },
    {
      evaluator: 'hasToolPermission' as const,
      permissionFlag: PermissionFlagType.HTTP_REQUEST_TOOL,
      basePermission: 'canAccessAllTools' as const,
    },
  ])(
    '$evaluator from workspace cache',
    ({ evaluator, permissionFlag, basePermission }) => {
      const workspaceId = 'test-workspace-id';
      const createFlatRole = ({
        id,
        hasBasePermission = false,
        rolePermissionFlagIds = [],
      }: {
        id: string;
        hasBasePermission?: boolean;
        rolePermissionFlagIds?: string[];
      }): FlatRole =>
        ({
          id,
          universalIdentifier: `${id}-universal-identifier`,
          canAccessAllTools: false,
          canUpdateAllSettings: false,
          rolePermissionFlagIds,
          [basePermission]: hasBasePermission,
        }) as FlatRole;
      const createFlatRolePermissionFlag = ({
        id,
        permissionFlagUniversalIdentifier,
      }: {
        id: string;
        permissionFlagUniversalIdentifier: string;
      }): FlatRolePermissionFlag =>
        ({
          id,
          universalIdentifier: `${id}-universal-identifier`,
          permissionFlagUniversalIdentifier,
        }) as FlatRolePermissionFlag;
      const mockCachedPermissions = ({
        roles,
        rolePermissionFlags = [],
      }: {
        roles: FlatRole[];
        rolePermissionFlags?: FlatRolePermissionFlag[];
      }) => {
        workspaceCacheService.getOrRecompute.mockResolvedValue({
          flatRoleMaps: buildFlatEntityMaps(roles),
          flatRolePermissionFlagMaps: buildFlatEntityMaps(rolePermissionFlags),
        });
      };
      const evaluate = (rolePermissionConfig: RolePermissionConfig) =>
        service[evaluator](rolePermissionConfig, workspaceId, permissionFlag);

      afterEach(() => {
        expect(roleRepository.find).not.toHaveBeenCalled();
      });

      it('preserves union and intersection semantics', async () => {
        const grantingRole = createFlatRole({
          id: 'granting-role-id',
          hasBasePermission: true,
        });
        const denyingRole = createFlatRole({
          id: 'denying-role-id',
        });

        mockCachedPermissions({
          roles: [grantingRole, denyingRole],
        });

        await expect(
          evaluate({ unionOf: [grantingRole.id, denyingRole.id] }),
        ).resolves.toBe(true);
        await expect(
          evaluate({ intersectionOf: [grantingRole.id, denyingRole.id] }),
        ).resolves.toBe(false);
        expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledWith(
          workspaceId,
          ['flatRoleMaps', 'flatRolePermissionFlagMaps'],
        );
      });

      it('grants an explicitly assigned permission flag', async () => {
        const rolePermissionFlag = createFlatRolePermissionFlag({
          id: 'role-permission-flag-id',
          permissionFlagUniversalIdentifier:
            SystemPermissionFlag[permissionFlag],
        });
        const role = createFlatRole({
          id: 'role-id',
          rolePermissionFlagIds: [rolePermissionFlag.id],
        });

        mockCachedPermissions({
          roles: [role],
          rolePermissionFlags: [rolePermissionFlag],
        });

        await expect(evaluate({ unionOf: [role.id] })).resolves.toBe(true);
      });

      it('denies an unrelated permission flag', async () => {
        const rolePermissionFlag = createFlatRolePermissionFlag({
          id: 'role-permission-flag-id',
          permissionFlagUniversalIdentifier: SystemPermissionFlag.WORKSPACE,
        });
        const role = createFlatRole({
          id: 'role-id',
          rolePermissionFlagIds: [rolePermissionFlag.id],
        });

        mockCachedPermissions({
          roles: [role],
          rolePermissionFlags: [rolePermissionFlag],
        });

        await expect(evaluate({ unionOf: [role.id] })).resolves.toBe(false);
      });

      it('bypasses checks without loading the cache', async () => {
        await expect(
          evaluate({ shouldBypassPermissionChecks: true }),
        ).resolves.toBe(true);
        expect(workspaceCacheService.getOrRecompute).not.toHaveBeenCalled();
      });

      it('fails closed for invalid or missing roles', async () => {
        const role = createFlatRole({
          id: 'role-id',
          hasBasePermission: true,
        });

        mockCachedPermissions({ roles: [role] });

        await expect(evaluate({ unionOf: [] })).resolves.toBe(false);
        await expect(evaluate({ unionOf: [role.id, role.id] })).resolves.toBe(
          false,
        );
        await expect(
          evaluate({ unionOf: [role.id, 'missing-role-id'] }),
        ).resolves.toBe(false);
      });

      it('fails closed when the workspace cache is unavailable', async () => {
        workspaceCacheService.getOrRecompute.mockRejectedValue(
          new Error('Cache unavailable'),
        );

        await expect(evaluate({ unionOf: ['role-id'] })).resolves.toBe(false);
      });
    },
  );
});
