import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ADMIN_ROLE_NAME } from 'src/engine/metadata-modules/permissions/constants/adminRoleName.constants';
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
  }): Promise<void> {
    await this.roleRepository.save({
      name: ADMIN_ROLE_NAME,
      label: 'Admin',
      description: 'Admin role',
      canUpdateAllSettings: true,
      isEditable: false,
      workspaceId,
    });
  }

  public async assignAdminRoleToUserWorkspace(
    workspaceId: string,
    userWorkspaceId: string,
  ): Promise<void> {
    const adminRole = await this.roleRepository.findOne({
      where: {
        name: ADMIN_ROLE_NAME,
        workspaceId,
      },
    });

    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        id: userWorkspaceId,
      },
    });

    if (!isDefined(userWorkspace)) {
      throw new Error('User workspace not found');
    }

    if (adminRole.workspaceId !== workspaceId) {
      throw new Error('Admin role workspace does not match user workspace');
    }

    await this.userWorkspaceRoleRepository.save({
      roleId: adminRole.id,
      userWorkspaceId: userWorkspace.id,
      workspaceId,
    });
  }

  public async isPermissionsV1Enabled(): Promise<boolean> {
    return this.environmentService.get('PERMISSIONS_V1_ENABLED') === true;
  }
}
