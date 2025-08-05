import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
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
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { isArgDefinedIfProvidedOrThrow } from 'src/engine/metadata-modules/utils/is-arg-defined-if-provided-or-throw.util';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

export class RoleService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RoleTargetsEntity, 'core')
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    private readonly userRoleService: UserRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  public async getWorkspaceRoles(workspaceId: string): Promise<RoleEntity[]> {
    return this.roleRepository.find({
      where: {
        workspaceId,
      },
      relations: {
        roleTargets: true,
        permissionFlags: true,
        objectPermissions: true,
        fieldPermissions: true,
      },
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
      relations: {
        roleTargets: true,
        permissionFlags: true,
        objectPermissions: true,
        fieldPermissions: true,
      },
    });
  }

  public async createRole({
    input,
    workspaceId,
  }: {
    input: CreateRoleInput;
    workspaceId: string;
  }): Promise<RoleEntity> {
    await this.validateRoleInputOrThrow({ input, workspaceId });

    const role = await this.roleRepository.save({
      id: input.id,
      label: input.label,
      description: input.description,
      icon: input.icon,
      canUpdateAllSettings: input.canUpdateAllSettings,
      canAccessAllTools: input.canAccessAllTools,
      canReadAllObjectRecords: input.canReadAllObjectRecords,
      canUpdateAllObjectRecords: input.canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords: input.canSoftDeleteAllObjectRecords,
      canDestroyAllObjectRecords: input.canDestroyAllObjectRecords,
      isEditable: true,
      workspaceId,
    });

    await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache({
      workspaceId,
      roleIds: [role.id],
    });

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
        {
          userFriendlyMessage:
            'The role you are looking for could not be found. It may have been deleted or you may not have access to it.',
        },
      );
    }

    await this.validateRoleInputOrThrow({
      input: input.update,
      workspaceId,
      roleId: input.id,
    });

    const updatedRole = await this.roleRepository.save({
      id: input.id,
      ...input.update,
    });

    await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache({
      workspaceId,
      roleIds: [input.id],
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
      canAccessAllTools: true,
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
        {
          userFriendlyMessage:
            'The default role for this workspace could not be found. Please contact support for assistance.',
        },
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

    await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache({
      workspaceId,
    });

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
      canAccessAllTools: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      isEditable: true,
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
      canAccessAllTools: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      isEditable: false,
      workspaceId,
    });
  }

  private async validateRoleInputOrThrow({
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
      'canAccessAllTools',
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
          // @ts-expect-error legacy noImplicitAny
          value: input[key],
        });
      } catch (error) {
        throw new PermissionsException(
          error.message,
          PermissionsExceptionCode.INVALID_ARG,
          {
            userFriendlyMessage:
              'Some of the information provided is invalid. Please check your input and try again.',
          },
        );
      }
    }

    const workspaceRoles = await this.getWorkspaceRoles(workspaceId);

    if (isDefined(input.label)) {
      let rolesForLabelComparison = workspaceRoles;

      if (isDefined(roleId)) {
        rolesForLabelComparison = workspaceRoles.filter(
          (role) => role.id !== roleId,
        );
      }

      if (rolesForLabelComparison.some((role) => role.label === input.label)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.ROLE_LABEL_ALREADY_EXISTS,
          PermissionsExceptionCode.ROLE_LABEL_ALREADY_EXISTS,
          { userFriendlyMessage: t`A role with this label already exists.` },
        );
      }
    }

    const existingRole = workspaceRoles.find((role) => role.id === roleId);

    await this.validateRoleReadAndWirtePermissionsConsistencyOrThrow({
      input,
      existingRole,
    });
  }

  private async validateRoleReadAndWirtePermissionsConsistencyOrThrow({
    input,
    existingRole,
  }: {
    input: CreateRoleInput | UpdateRolePayload;
    existingRole?: RoleEntity;
  }) {
    const hasReadingPermissionsAfterUpdate =
      input.canReadAllObjectRecords ?? existingRole?.canReadAllObjectRecords;

    const hasUpdatePermissionsAfterUpdate =
      input.canUpdateAllObjectRecords ??
      existingRole?.canUpdateAllObjectRecords;

    const hasSoftDeletePermissionsAfterUpdate =
      input.canSoftDeleteAllObjectRecords ??
      existingRole?.canSoftDeleteAllObjectRecords;

    const hasDestroyPermissionsAfterUpdate =
      input.canDestroyAllObjectRecords ??
      existingRole?.canDestroyAllObjectRecords;

    if (
      hasReadingPermissionsAfterUpdate === false &&
      (hasUpdatePermissionsAfterUpdate ||
        hasSoftDeletePermissionsAfterUpdate ||
        hasDestroyPermissionsAfterUpdate)
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
        PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
        {
          userFriendlyMessage:
            'You cannot grant edit permissions without also granting read permissions. Please enable read access first.',
        },
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
    const userWorkspaceIds =
      await this.userRoleService.getUserWorkspaceIdsAssignedToRole(
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
        {
          userFriendlyMessage:
            'This role cannot be modified because it is a system role. Only custom roles can be edited.',
        },
      );
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
        {
          userFriendlyMessage:
            'The default role cannot be deleted as it is required for the workspace to function properly.',
        },
      );
    }
  }
}
