import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/permissions/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/permissions/user-workspace-role.entity';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserWorkspaceRoleEntity, 'metadata')
    private readonly userWorkspaceRoleRepository: Repository<UserWorkspaceRoleEntity>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly environmentService: EnvironmentService,
  ) {}

  public async createAdminRole({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<RoleEntity> {
    return this.roleRepository.save({
      label: 'Admin',
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
    await this.userWorkspaceRoleRepository.save({
      roleId,
      userWorkspaceId: userWorkspace.id,
      workspaceId,
    });
  }

  public async isPermissionsEnabled(): Promise<boolean> {
    return this.environmentService.get('PERMISSIONS_ENABLED') === true;
  }
}
