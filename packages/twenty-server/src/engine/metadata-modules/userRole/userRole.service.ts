import { InjectRepository } from '@nestjs/typeorm';

import isEmpty from 'lodash.isempty';
import { isDefined } from 'twenty-shared';
import { In, Repository } from 'typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class UserRoleService {
  constructor(
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserWorkspaceRoleEntity, 'metadata')
    private readonly userWorkspaceRoleRepository: Repository<UserWorkspaceRoleEntity>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async unassignRolesFromUserWorkspace({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const userWorkspaceRoles = await this.userWorkspaceRoleRepository.find({
      where: {
        userWorkspaceId,
        workspaceId,
      },
    });

    if (!isEmpty(userWorkspaceRoles)) {
      userWorkspaceRoles.forEach(async (userWorkspaceRole) => {
        await this.userWorkspaceRoleRepository.delete({
          id: userWorkspaceRole.id,
        });
      });
    }
  }

  public async assignRoleToUserWorkspace({
    workspaceId,
    userWorkspaceId,
    roleId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    roleId: string;
  }): Promise<void> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        id: userWorkspaceId,
      },
    });

    if (!isDefined(userWorkspace)) {
      throw new PermissionsException(
        'User workspace not found',
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    await this.unassignRolesFromUserWorkspace({
      userWorkspaceId: userWorkspace.id,
      workspaceId,
    });

    await this.userWorkspaceRoleRepository.save({
      roleId,
      userWorkspaceId: userWorkspace.id,
      workspaceId,
    });
  }

  public async getRoleForUserWorkspace(
    userWorkspaceId: string,
  ): Promise<RoleEntity | null> {
    if (!isDefined(userWorkspaceId)) {
      return null;
    }

    const userWorkspaceRole = await this.userWorkspaceRoleRepository.findOne({
      where: {
        userWorkspaceId,
      },
    });

    if (!isDefined(userWorkspaceRole)) {
      return null;
    }

    return await this.roleRepository.findOne({
      where: {
        id: userWorkspaceRole.roleId,
      },
    });
  }

  public async getWorkspaceMembersAssignedToRole(
    roleId: string,
    workspaceId: string,
  ): Promise<WorkspaceMemberWorkspaceEntity[]> {
    const userWorkspaceRoles = await this.userWorkspaceRoleRepository.find({
      where: {
        roleId,
        workspaceId,
      },
    });

    const userIds = await this.userWorkspaceRepository
      .find({
        where: {
          id: In(
            userWorkspaceRoles.map(
              (userWorkspaceRole) => userWorkspaceRole.userWorkspaceId,
            ),
          ),
        },
      })
      .then((userWorkspaces) =>
        userWorkspaces.map((userWorkspace) => userWorkspace.userId),
      );

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const workspaceMembers = await workspaceMemberRepository.find({
      where: {
        userId: In(userIds),
      },
    });

    return workspaceMembers;
  }
}
