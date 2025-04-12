import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';
import {
  UpdateRoleInput,
  UpdateRolePayload,
} from 'src/engine/metadata-modules/role/dtos/update-role-input.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { isArgDefinedIfProvidedOrThrow } from 'src/engine/metadata-modules/utils/is-arg-defined-if-provided-or-throw.util';
import { WorkspaceRolesPermissionsCacheService } from 'src/engine/metadata-modules/workspace-roles-permissions-cache/workspace-roles-permissions-cache.service';

export class RoleService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserWorkspaceRoleEntity, 'metadata')
    private readonly userWorkspaceRoleRepository: Repository<UserWorkspaceRoleEntity>,
    private readonly userRoleService: UserRoleService,
    private readonly workspaceRolesPermissionsCacheService: WorkspaceRolesPermissionsCacheService,
  ) {}

  public async getWorkspaceRoles(workspaceId: string): Promise<RoleEntity[]> {
    return this.roleRepository.find({
      where: {
        workspaceId,
      },
      relations: ['userWorkspaceRoles', 'settingPermissions'],
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
      relations: ['userWorkspaceRoles', 'settingPermissions'],
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

    const role = this.roleRepository.save({
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

    await this.workspaceRolesPermissionsCacheService.recomputeRolesPermissionsCache(
      {
        workspaceId,
      },
    );

    return role;
  }

  public async updateRole({
    input,
    workspaceId,
  }: {
    input: UpdateRoleInput;
    workspaceId: string;
  }): Promise<RoleEntity> {
    await this.validateRoleIsEditableOrThrow({
      roleId: input.id,
      workspaceId,
    });

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

    await this.workspaceRolesPermissionsCacheService.recomputeRolesPermissionsCache(
      {
        workspaceId,
      },
    );

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

  public async deleteRole(
    roleId: string,
    workspaceId: string,
  ): Promise<string> {
    await this.validateRoleIsEditableOrThrow({
      roleId,
      workspaceId,
    });

    const defaultRole = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    const defaultRoleId = defaultRole?.defaultRoleId;

    if (!isDefined(defaultRoleId)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.DEFAULT_ROLE_NOT_FOUND,
        PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND,
      );
    }

    await this.validateRoleIsNotDefaultRoleOrThrow({
      roleId,
      defaultRoleId,
    });

    await this.assignDefaultRoleToMembersWithRoleToDelete({
      roleId,
      workspaceId,
      defaultRoleId,
    });

    await this.roleRepository.delete({
      id: roleId,
      workspaceId,
    });

    await this.workspaceRolesPermissionsCacheService.recomputeRolesPermissionsCache(
      {
        workspaceId,
      },
    );

    return roleId;
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

  private async validateRoleIsNotDefaultRoleOrThrow({
    roleId,
    defaultRoleId,
  }: {
    roleId: string;
    defaultRoleId: string;
  }): Promise<void> {
    if (defaultRoleId === roleId) {
      throw new PermissionsException(
        PermissionsExceptionMessage.DEFAULT_ROLE_CANNOT_BE_DELETED,
        PermissionsExceptionCode.DEFAULT_ROLE_CANNOT_BE_DELETED,
      );
    }
  }

  private async assignDefaultRoleToMembersWithRoleToDelete({
    roleId,
    workspaceId,
    defaultRoleId,
  }: {
    roleId: string;
    workspaceId: string;
    defaultRoleId: string;
  }): Promise<void> {
    const userWorkspaceIds = await this.getUserWorkspaceIdsForRole(
      roleId,
      workspaceId,
    );

    await Promise.all(
      userWorkspaceIds.map((userWorkspaceId) =>
        this.userRoleService.assignRoleToUserWorkspace({
          userWorkspaceId,
          roleId: defaultRoleId,
          workspaceId,
        }),
      ),
    );
  }

  private async getUserWorkspaceIdsForRole(
    roleId: string,
    workspaceId: string,
  ): Promise<string[]> {
    return this.userWorkspaceRoleRepository
      .find({
        where: {
          roleId: roleId,
          workspaceId,
        },
      })
      .then((userWorkspaceRoles) =>
        userWorkspaceRoles.map(
          (userWorkspaceRole) => userWorkspaceRole.userWorkspaceId,
        ),
      );
  }

  private async getRole(
    roleId: string,
    workspaceId: string,
  ): Promise<RoleEntity | null> {
    return this.roleRepository.findOne({
      where: {
        id: roleId,
        workspaceId,
      },
    });
  }

  private async validateRoleIsEditableOrThrow({
    roleId,
    workspaceId,
  }: {
    roleId: string;
    workspaceId: string;
  }) {
    const role = await this.getRole(roleId, workspaceId);

    if (!role?.isEditable) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
        PermissionsExceptionCode.ROLE_NOT_EDITABLE,
      );
    }
  }
}
