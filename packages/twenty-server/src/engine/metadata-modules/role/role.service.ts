import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export class RoleService {
  constructor(
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
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
}
