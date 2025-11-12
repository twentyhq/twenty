import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

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
          provide: WorkspacePermissionsCacheService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  describe('checkRolePermissions', () => {
    describe('canAccessAllTools for tool permissions', () => {
      it('should grant permission when canAccessAllTools is true for a tool permission', () => {
        const roleWithAllTools: RoleEntity = {
          id: 'test-role-id',
          label: 'Test Role',
          canAccessAllTools: true,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          permissionFlags: [],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        } as RoleEntity;

        // Test all tool permissions
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.UPLOAD_FILE,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.DOWNLOAD_FILE,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(roleWithAllTools, PermissionFlagType.AI),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.VIEWS,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.SEND_EMAIL_TOOL,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.IMPORT_CSV,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.EXPORT_CSV,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.CONNECTED_ACCOUNTS,
          ),
        ).toBe(true);
      });

      it('should NOT grant settings permissions when canAccessAllTools is true', () => {
        const roleWithAllTools: RoleEntity = {
          id: 'test-role-id',
          label: 'Test Role',
          canAccessAllTools: true,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          permissionFlags: [],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        } as RoleEntity;

        // Test that settings permissions are NOT granted
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.ROLES,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.WORKSPACE,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.DATA_MODEL,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllTools,
            PermissionFlagType.SECURITY,
          ),
        ).toBe(false);
      });
    });

    describe('canUpdateAllSettings for settings permissions', () => {
      it('should grant permission when canUpdateAllSettings is true for a settings permission', () => {
        const roleWithAllSettings: RoleEntity = {
          id: 'test-role-id',
          label: 'Test Role',
          canAccessAllTools: false,
          canUpdateAllSettings: true,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          permissionFlags: [],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        } as RoleEntity;

        // Test all settings permissions
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.ROLES,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.WORKSPACE,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.DATA_MODEL,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.SECURITY,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.WORKFLOWS,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.WORKSPACE_MEMBERS,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.API_KEYS_AND_WEBHOOKS,
          ),
        ).toBe(true);
      });

      it('should NOT grant tool permissions when canUpdateAllSettings is true', () => {
        const roleWithAllSettings: RoleEntity = {
          id: 'test-role-id',
          label: 'Test Role',
          canAccessAllTools: false,
          canUpdateAllSettings: true,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          permissionFlags: [],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        } as RoleEntity;

        // Test that tool permissions are NOT granted
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.UPLOAD_FILE,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.DOWNLOAD_FILE,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.AI,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithAllSettings,
            PermissionFlagType.VIEWS,
          ),
        ).toBe(false);
      });
    });

    describe('Granular permissions with permissionFlags', () => {
      it('should grant specific tool permission when included in permissionFlags even if canAccessAllTools is false', () => {
        const roleWithSpecificPermission: RoleEntity = {
          id: 'test-role-id',
          label: 'Test Role',
          canAccessAllTools: false,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          permissionFlags: [
            {
              id: 'permission-1',
              flag: PermissionFlagType.UPLOAD_FILE,
              roleId: 'test-role-id',
              workspaceId: 'test-workspace-id',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        } as RoleEntity;

        expect(
          service.checkRolePermissions(
            roleWithSpecificPermission,
            PermissionFlagType.UPLOAD_FILE,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithSpecificPermission,
            PermissionFlagType.DOWNLOAD_FILE,
          ),
        ).toBe(false);
      });

      it('should grant specific settings permission when included in permissionFlags even if canUpdateAllSettings is false', () => {
        const roleWithSpecificPermission: RoleEntity = {
          id: 'test-role-id',
          label: 'Test Role',
          canAccessAllTools: false,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          permissionFlags: [
            {
              id: 'permission-1',
              flag: PermissionFlagType.ROLES,
              roleId: 'test-role-id',
              workspaceId: 'test-workspace-id',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        } as RoleEntity;

        expect(
          service.checkRolePermissions(
            roleWithSpecificPermission,
            PermissionFlagType.ROLES,
          ),
        ).toBe(true);
        expect(
          service.checkRolePermissions(
            roleWithSpecificPermission,
            PermissionFlagType.WORKSPACE,
          ),
        ).toBe(false);
      });
    });

    describe('No permissions', () => {
      it('should deny all permissions when neither canAccessAllTools nor canUpdateAllSettings are true and no specific permissions', () => {
        const roleWithNoPermissions: RoleEntity = {
          id: 'test-role-id',
          label: 'Test Role',
          canAccessAllTools: false,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          permissionFlags: [],
          workspaceId: 'test-workspace-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEditable: true,
        } as RoleEntity;

        // Tool permissions should be denied
        expect(
          service.checkRolePermissions(
            roleWithNoPermissions,
            PermissionFlagType.UPLOAD_FILE,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithNoPermissions,
            PermissionFlagType.AI,
          ),
        ).toBe(false);

        // Settings permissions should be denied
        expect(
          service.checkRolePermissions(
            roleWithNoPermissions,
            PermissionFlagType.ROLES,
          ),
        ).toBe(false);
        expect(
          service.checkRolePermissions(
            roleWithNoPermissions,
            PermissionFlagType.WORKSPACE,
          ),
        ).toBe(false);
      });
    });
  });
});
