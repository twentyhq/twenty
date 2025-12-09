import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: {},
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
          permissionFlags: [],
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
          permissionFlags: [],
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
          permissionFlags: [],
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
          permissionFlags: [],
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

    describe('Granular permissions with permissionFlags', () => {
      it('should grant specific tool permission when included in permissionFlags even if canAccessAllTools is false', () => {
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
          permissionFlags: [
            {
              id: 'permission-1',
              flag: PermissionFlagType.UPLOAD_FILE,
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

      it('should grant specific settings permission when included in permissionFlags even if canUpdateAllSettings is false', () => {
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
          permissionFlags: [
            {
              id: 'permission-1',
              flag: PermissionFlagType.ROLES,
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
          permissionFlags: [],
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
});
