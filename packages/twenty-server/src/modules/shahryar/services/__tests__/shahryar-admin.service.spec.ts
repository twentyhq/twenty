import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

jest.mock('src/engine/core-modules/auth/services/auth.service', () => ({
  AuthService: class AuthService {},
}));

jest.mock(
  'src/engine/core-modules/user-workspace/user-workspace.service',
  () => ({
    UserWorkspaceService: class UserWorkspaceService {},
  }),
);

jest.mock('src/engine/metadata-modules/user-role/user-role.service', () => ({
  UserRoleService: class UserRoleService {},
}));

import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { ShahryarAdminWorkspaceService } from 'src/modules/shahryar/services/shahryar-admin.workspace-service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { DataSource } from 'typeorm';

describe('ShahryarAdminWorkspaceService', () => {
  let service: ShahryarAdminWorkspaceService;
  let authService: jest.Mocked<Pick<AuthService, 'updatePassword'>>;
  let coreDataSource: jest.Mocked<Pick<DataSource, 'query'>>;
  let userRoleService: jest.Mocked<
    Pick<UserRoleService, 'getRolesByUserWorkspaces'>
  >;
  let userWorkspaceService: jest.Mocked<
    Pick<UserWorkspaceService, 'getWorkspaceMemberOrThrow'>
  >;

  beforeEach(async () => {
    authService = {
      updatePassword: jest.fn().mockResolvedValue({ success: true }),
    };
    coreDataSource = {
      query: jest.fn(),
    };
    userRoleService = {
      getRolesByUserWorkspaces: jest.fn(),
    };
    userWorkspaceService = {
      getWorkspaceMemberOrThrow: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ShahryarAdminWorkspaceService,
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: UserRoleService,
          useValue: userRoleService,
        },
        {
          provide: UserWorkspaceService,
          useValue: userWorkspaceService,
        },
        {
          provide: DataSource,
          useValue: coreDataSource,
        },
      ],
    }).compile();

    service = moduleRef.get(ShahryarAdminWorkspaceService);
  });

  it('should reset a workspace member password when the caller is a Shahryar admin', async () => {
    userRoleService.getRolesByUserWorkspaces.mockResolvedValue(
      new Map([
        [
          'admin-user-workspace-id',
          [
            {
              canUpdateAllSettings: true,
            } as RoleEntity,
          ],
        ],
      ]),
    );
    userWorkspaceService.getWorkspaceMemberOrThrow.mockResolvedValue({
      id: 'target-workspace-member-id',
      userId: 'target-user-id',
    } as WorkspaceMemberWorkspaceEntity);

    const response = await service.resetWorkspaceMemberPassword({
      workspaceId: 'workspace-id',
      adminUserWorkspaceId: 'admin-user-workspace-id',
      workspaceMemberId: 'target-workspace-member-id',
      newPassword: 'new-password',
      resetAt: new Date('2026-06-01T10:00:00.000Z'),
    });

    expect(userRoleService.getRolesByUserWorkspaces).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      userWorkspaceIds: ['admin-user-workspace-id'],
    });
    expect(userWorkspaceService.getWorkspaceMemberOrThrow).toHaveBeenCalledWith(
      {
        workspaceId: 'workspace-id',
        workspaceMemberId: 'target-workspace-member-id',
      },
    );
    expect(authService.updatePassword).toHaveBeenCalledWith(
      'target-user-id',
      'new-password',
    );
    expect(response).toEqual({
      success: true,
      workspaceMemberId: 'target-workspace-member-id',
      resetAt: '2026-06-01T10:00:00.000Z',
    });
  });

  it('should list workspace members when the caller is a Shahryar admin', async () => {
    userRoleService.getRolesByUserWorkspaces.mockResolvedValue(
      new Map([
        [
          'admin-user-workspace-id',
          [
            {
              canUpdateAllSettings: true,
            } as RoleEntity,
          ],
        ],
      ]),
    );
    coreDataSource.query.mockResolvedValue([
      {
        id: 'workspace-member-1',
        nameFirstName: 'Karwan',
        nameLastName: 'Supervisor',
        username: 'karwan',
        userEmail: 'karwan@example.test',
      },
      {
        id: 'workspace-member-2',
        nameFirstName: null,
        nameLastName: null,
        username: 'halo',
        userEmail: null,
      },
    ]);

    await expect(
      service.listWorkspaceMembers({
        workspaceId: '20202020-0000-4000-8000-000000000001',
        adminUserWorkspaceId: 'admin-user-workspace-id',
      }),
    ).resolves.toEqual([
      {
        id: 'workspace-member-1',
        name: 'Karwan Supervisor',
        username: 'karwan',
        userEmail: 'karwan@example.test',
      },
      {
        id: 'workspace-member-2',
        name: 'halo',
        username: 'halo',
        userEmail: '',
      },
    ]);
    expect(coreDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM "workspace_'),
    );
  });

  it('should reject password resets from non-admin users', async () => {
    userRoleService.getRolesByUserWorkspaces.mockResolvedValue(
      new Map([
        [
          'supervisor-user-workspace-id',
          [
            {
              canUpdateAllSettings: false,
            } as RoleEntity,
          ],
        ],
      ]),
    );

    await expect(
      service.resetWorkspaceMemberPassword({
        workspaceId: 'workspace-id',
        adminUserWorkspaceId: 'supervisor-user-workspace-id',
        workspaceMemberId: 'target-workspace-member-id',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(
      userWorkspaceService.getWorkspaceMemberOrThrow,
    ).not.toHaveBeenCalled();
    expect(authService.updatePassword).not.toHaveBeenCalled();
  });

  it('should reject password resets without a workspace user context', async () => {
    await expect(
      service.resetWorkspaceMemberPassword({
        workspaceId: 'workspace-id',
        adminUserWorkspaceId: undefined,
        workspaceMemberId: 'target-workspace-member-id',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(userRoleService.getRolesByUserWorkspaces).not.toHaveBeenCalled();
  });
});
