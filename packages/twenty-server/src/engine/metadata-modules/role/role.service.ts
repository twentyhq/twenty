import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
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
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      isEditable: false,
      workspaceId,
    });
  }

  public async createMemberRole({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<RoleEntity> {
    return this.roleRepository.save({
      label: MEMBER_ROLE_LABEL,
      description: 'Member role',
      canUpdateAllSettings: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      isEditable: false,
      workspaceId,
    });
  }

  // Only used for dev seeding and testing
  public async createGuestRole({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<RoleEntity> {
    return this.roleRepository.save({
      label: 'Guest',
      description: 'Guest role',
      canUpdateAllSettings: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      isEditable: false,
      workspaceId,
    });
  }
}
