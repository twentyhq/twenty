import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { isDefined } from 'src/utils/is-defined';

export class RoleService {
  constructor(
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserWorkspaceRoleEntity, 'metadata')
    private readonly userWorkspaceRoleRepository: Repository<UserWorkspaceRoleEntity>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

  public async getWorkspaceRoles(workspaceId: string): Promise<RoleEntity[]> {
    return this.roleRepository.find({
      where: {
        workspaceId,
      },
      relations: ['userWorkspaceRoles'],
    });
  }

  public async createAdminRole({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<RoleEntity> {
    return this.roleRepository.save({
      label: ADMIN_ROLE_LABEL,
      description: 'Admin role',
      canUpdateAllSettings: true,
      isEditable: false,
      workspaceId,
    });
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

    const userWorkspaceRole = await this.userWorkspaceRoleRepository.findOne({
      where: {
        userWorkspaceId,
      },
    });

    if (isDefined(userWorkspaceRole)) {
      await this.userWorkspaceRoleRepository.delete({
        id: userWorkspaceRole.id,
      });
    }

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
}
