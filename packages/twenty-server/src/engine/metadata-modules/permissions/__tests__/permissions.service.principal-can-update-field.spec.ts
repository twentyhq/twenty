import {
  type ObjectPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('PermissionsService.principalCanUpdateField', () => {
  const workspaceId = 'workspace-1';
  const objectMetadataId = 'object-1';
  const fieldMetadataId = 'field-1';
  const userRoleId = 'user-role';
  const applicationRoleId = 'application-role';

  let userRoleService: jest.Mocked<UserRoleService>;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;
  let applicationRepository: jest.Mocked<Repository<ApplicationEntity>>;

  const buildObjectPermissions = (
    overrides: Partial<ObjectPermissions> = {},
  ): ObjectPermissions => ({
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
    ...overrides,
  });

  const setRolesPermissions = (
    rolesPermissions: ObjectsPermissionsByRoleId,
  ) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      rolesPermissions,
    } as never);
  };

  const buildService = () =>
    new PermissionsService(
      userRoleService,
      workspaceCacheService,
      {} as never,
      {} as never,
      applicationRepository,
    );

  const principalCanUpdateField = ({
    userWorkspaceId = 'user-workspace-1',
  }: { userWorkspaceId?: string | null } = {}) =>
    buildService().principalCanUpdateField({
      workspaceId,
      objectMetadataId,
      fieldMetadataId,
      userWorkspaceId,
      applicationId: 'application-a',
    });

  beforeEach(() => {
    userRoleService = {
      getRoleIdForUserWorkspace: jest.fn().mockResolvedValue(userRoleId),
    } as unknown as jest.Mocked<UserRoleService>;

    workspaceCacheService = {
      getOrRecompute: jest.fn(),
    } as unknown as jest.Mocked<WorkspaceCacheService>;

    applicationRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'application-a',
        defaultRoleId: applicationRoleId,
      }),
    } as unknown as jest.Mocked<Repository<ApplicationEntity>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow when both the user role and the application role can update the object', async () => {
    setRolesPermissions({
      [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
      [applicationRoleId]: { [objectMetadataId]: buildObjectPermissions() },
    });

    await expect(principalCanUpdateField()).resolves.toBe(true);
  });

  it('should refuse when the application role cannot update the object although the user role can', async () => {
    setRolesPermissions({
      [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
      [applicationRoleId]: {
        [objectMetadataId]: buildObjectPermissions({
          canUpdateObjectRecords: false,
        }),
      },
    });

    await expect(principalCanUpdateField()).resolves.toBe(false);
  });

  it('should refuse when the user role cannot update the object although the application role can', async () => {
    setRolesPermissions({
      [userRoleId]: {
        [objectMetadataId]: buildObjectPermissions({
          canUpdateObjectRecords: false,
        }),
      },
      [applicationRoleId]: { [objectMetadataId]: buildObjectPermissions() },
    });

    await expect(principalCanUpdateField()).resolves.toBe(false);
  });

  it('should refuse when a role restricts updates on the field', async () => {
    setRolesPermissions({
      [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
      [applicationRoleId]: {
        [objectMetadataId]: buildObjectPermissions({
          restrictedFields: { [fieldMetadataId]: { canUpdate: false } },
        }),
      },
    });

    await expect(principalCanUpdateField()).resolves.toBe(false);
  });

  it('should refuse an object the application role does not know', async () => {
    setRolesPermissions({
      [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
      [applicationRoleId]: { 'other-object': buildObjectPermissions() },
    });

    await expect(principalCanUpdateField()).resolves.toBe(false);
  });

  it('should evaluate an application-only principal against the application role alone', async () => {
    setRolesPermissions({
      [applicationRoleId]: { [objectMetadataId]: buildObjectPermissions() },
    });

    await expect(
      principalCanUpdateField({ userWorkspaceId: null }),
    ).resolves.toBe(true);

    expect(userRoleService.getRoleIdForUserWorkspace).not.toHaveBeenCalled();
  });

  it('should bind an application without a declared role to the user role alone, as the attach step does', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: 'application-a',
      defaultRoleId: null,
    } as ApplicationEntity);
    setRolesPermissions({
      [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
    });

    await expect(principalCanUpdateField()).resolves.toBe(true);
  });

  it('should refuse an application-only principal whose application declares no role', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: 'application-a',
      defaultRoleId: null,
    } as ApplicationEntity);
    setRolesPermissions({
      [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
    });

    await expect(
      principalCanUpdateField({ userWorkspaceId: null }),
    ).resolves.toBe(false);
  });
});
