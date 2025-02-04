import { InjectRepository } from '@nestjs/typeorm';

import isEmpty from 'lodash.isempty';
import { isDefined } from 'twenty-shared';
import { In, Repository } from 'typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
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

  public async assignRoleToWorkspaceMember({
    workspaceMemberId,
    workspaceId,
    roleId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
    roleId: string;
  }): Promise<WorkspaceMember> {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const workspaceMember = await workspaceMemberRepository.findOne({
      where: {
        id: workspaceMemberId,
      },
    });

    if (!isDefined(workspaceMember)) {
      throw new PermissionsException(
        'Workspace member not found',
        PermissionsExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    const userWorkspace = await this.getUserWorkspaceForUser(
      workspaceMember.userId,
      workspaceId,
    );

    const [roleForUserWorkspace] = await this.getRolesForUserWorkspace(
      userWorkspace.id,
    );

    if (roleForUserWorkspace?.id === roleId) {
      console.warn('Role already assigned');

      return {
        ...workspaceMember,
        userWorkspaceId: userWorkspace.id,
        roles: [roleForUserWorkspace],
      } as WorkspaceMember;
    }

    await this.assignRoleToUserWorkspace({
      workspaceId: workspaceId,
      userWorkspaceId: userWorkspace.id,
      roleId: roleId,
    });

    const roles = await this.getRolesForUserWorkspace(userWorkspace.id);

    return {
      ...workspaceMember,
      userWorkspaceId: userWorkspace.id,
      roles,
    } as WorkspaceMember;
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

  public async unassignRolesFromWorkspaceMember({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<WorkspaceMember> {
    const workspaceMember = await this.getWorkspaceMemberOrThrow(
      workspaceMemberId,
      workspaceId,
    );

    const userWorkspace = await this.getUserWorkspaceForUser(
      workspaceMember.userId,
      workspaceId,
    );

    await this.unassignRolesFromUserWorkspace({
      userWorkspaceId: userWorkspace.id,
      workspaceId,
    });

    const roles = await this.getRolesForUserWorkspace(userWorkspace.id);

    return {
      ...workspaceMember,
      userWorkspaceId: userWorkspace.id,
      roles,
    } as WorkspaceMember;
  }

  public async unassignRolesFromUserWorkspace({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.validatesUserWorkspaceIsNotLastAdminIfUnassigningAdminRoleOrThrow(
      userWorkspaceId,
      workspaceId,
    );

    const userWorkspaceRoles = await this.userWorkspaceRoleRepository.find({
      where: {
        userWorkspaceId,
        workspaceId,
      },
    });

    if (!isEmpty(userWorkspaceRoles)) {
      await Promise.all(
        userWorkspaceRoles.map((userWorkspaceRole) =>
          this.userWorkspaceRoleRepository.delete({
            id: userWorkspaceRole.id,
          }),
        ),
      );
    }
  }

  public async getRolesForUserWorkspace(
    userWorkspaceId: string,
  ): Promise<RoleDTO[] | []> {
    if (!isDefined(userWorkspaceId)) {
      return [];
    }

    const userWorkspaceRole = await this.userWorkspaceRoleRepository.findOne({
      where: {
        userWorkspaceId,
      },
    });

    if (!isDefined(userWorkspaceRole)) {
      return [];
    }

    const role = await this.roleRepository.findOne({
      where: {
        id: userWorkspaceRole.roleId,
      },
    });

    if (!isDefined(role)) {
      throw new PermissionsException(
        'Role not found',
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      );
    }

    return [role];
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

  private async getUserWorkspaceForUser(
    userId: string,
    workspaceId: string,
  ): Promise<UserWorkspace> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId,
        workspaceId,
      },
    });

    if (!isDefined(userWorkspace)) {
      throw new PermissionsException(
        'User workspace not found',
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    return userWorkspace;
  }

  private async getWorkspaceMemberOrThrow(
    workspaceMemberId: string,
    workspaceId: string,
  ): Promise<WorkspaceMemberWorkspaceEntity> {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const workspaceMember = await workspaceMemberRepository.findOne({
      where: {
        id: workspaceMemberId,
      },
    });

    if (!isDefined(workspaceMember)) {
      throw new PermissionsException(
        'Workspace member not found',
        PermissionsExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    return workspaceMember;
  }

  private async validatesUserWorkspaceIsNotLastAdminIfUnassigningAdminRoleOrThrow(
    userWorkspaceId: string,
    workspaceId: string,
  ): Promise<void> {
    const roles = await this.getRolesForUserWorkspace(userWorkspaceId);

    const adminRole = roles.find((role: RoleDTO) => role.isEditable === false);

    if (isDefined(adminRole)) {
      const workspaceMembersWithAdminRole =
        await this.getWorkspaceMembersAssignedToRole(adminRole.id, workspaceId);

      if (workspaceMembersWithAdminRole.length === 1) {
        throw new PermissionsException(
          `Cannot unassign admin role as there is only one admin in the workspace`,
          PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN,
        );
      }
    }
  }
}
