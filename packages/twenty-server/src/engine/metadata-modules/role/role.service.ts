import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared';
import { Repository } from 'typeorm';

import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/createRoleInput.dto';
import {
  UpdateRoleInput,
  UpdateRolePayload,
} from 'src/engine/metadata-modules/role/dtos/updateRoleInput.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { isArgDefinedIfProvidedOrThrow } from 'src/engine/metadata-modules/utils/is-arg-defined-if-provided-or-throw.util';

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

  public async getRoleById(
    id: string,
    workspaceId: string,
  ): Promise<RoleEntity | null> {
    return this.roleRepository.findOne({
      where: {
        id,
        workspaceId,
      },
      relations: ['userWorkspaceRoles'],
    });
  }

  public async createRole({
    input,
    workspaceId,
  }: {
    input: CreateRoleInput;
    workspaceId: string;
  }): Promise<RoleEntity> {
    await this.validateRoleInput({ input, workspaceId });

    return this.roleRepository.save({
      label: input.label,
      description: input.description,
      icon: input.icon,
      canUpdateAllSettings: input.canUpdateAllSettings,
      canReadAllObjectRecords: input.canReadAllObjectRecords,
      canUpdateAllObjectRecords: input.canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords: input.canSoftDeleteAllObjectRecords,
      canDestroyAllObjectRecords: input.canDestroyAllObjectRecords,
      isEditable: true,
      workspaceId,
    });
  }

  public async updateRole({
    input,
    workspaceId,
  }: {
    input: UpdateRoleInput;
    workspaceId: string;
  }): Promise<RoleEntity> {
    const existingRole = await this.roleRepository.findOne({
      where: {
        id: input.id,
        workspaceId,
      },
    });

    if (!isDefined(existingRole)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      );
    }

    await this.validateRoleInput({
      input: input.update,
      workspaceId,
      roleId: input.id,
    });

    const updatedRole = await this.roleRepository.save({
      id: input.id,
      ...input.update,
    });

    return { ...existingRole, ...updatedRole };
  }

  public async createAdminRole({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<RoleEntity> {
    return this.roleRepository.save({
      label: ADMIN_ROLE_LABEL,
      description: 'Admin role',
      icon: 'IconUserCog',
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
      icon: 'IconUser',
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
      icon: 'IconUser',
      canUpdateAllSettings: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      isEditable: false,
      workspaceId,
    });
  }

  private async validateRoleInput({
    input,
    workspaceId,
    roleId,
  }: {
    input: CreateRoleInput | UpdateRolePayload;
    workspaceId: string;
    roleId?: string;
  }): Promise<void> {
    const keysToValidate = [
      'label',
      'canUpdateAllSettings',
      'canReadAllObjectRecords',
      'canUpdateAllObjectRecords',
      'canSoftDeleteAllObjectRecords',
      'canDestroyAllObjectRecords',
    ];

    for (const key of keysToValidate) {
      try {
        isArgDefinedIfProvidedOrThrow({
          input,
          key,
          value: input[key],
        });
      } catch (error) {
        throw new PermissionsException(
          error.message,
          PermissionsExceptionCode.INVALID_ARG,
        );
      }
    }

    if (isDefined(input.label)) {
      let workspaceRoles = await this.getWorkspaceRoles(workspaceId);

      if (isDefined(roleId)) {
        workspaceRoles = workspaceRoles.filter((role) => role.id !== roleId);
      }

      if (workspaceRoles.some((role) => role.label === input.label)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.ROLE_LABEL_ALREADY_EXISTS,
          PermissionsExceptionCode.ROLE_LABEL_ALREADY_EXISTS,
        );
      }
    }
  }
}
