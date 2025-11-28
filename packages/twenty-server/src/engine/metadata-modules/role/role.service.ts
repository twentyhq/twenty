import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';
import {
  type UpdateRoleInput,
  type UpdateRolePayload,
} from 'src/engine/metadata-modules/role/dtos/update-role-input.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { isArgDefinedIfProvidedOrThrow } from 'src/engine/metadata-modules/utils/is-arg-defined-if-provided-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export class RoleService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly userRoleService: UserRoleService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    await this.validateRoleInputOrThrow({ input, workspaceId });

    const id = input.id ?? v4();
    const role = await this.roleRepository.save({
      id,
      label: input.label,
      description: input.description,
      icon: input.icon,
      canUpdateAllSettings: input.canUpdateAllSettings,
      canAccessAllTools: input.canAccessAllTools,
      canReadAllObjectRecords: input.canReadAllObjectRecords,
      canUpdateAllObjectRecords: input.canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords: input.canSoftDeleteAllObjectRecords,
      canDestroyAllObjectRecords: input.canDestroyAllObjectRecords,
      canBeAssignedToUsers: input.canBeAssignedToUsers,
      canBeAssignedToAgents: input.canBeAssignedToAgents,
      canBeAssignedToApiKeys: input.canBeAssignedToApiKeys,
      isEditable: true,
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
      universalIdentifier: id,
    });

    await this.workspaceCacheService.invalidate(workspaceId, [
      'rolesPermissions',
    ]);

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
          userFriendlyMessage: msg`The role you are looking for could not be found. It may have been deleted or you may not have access to it.`,
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

    await this.workspaceCacheService.invalidate(workspaceId, [
      'rolesPermissions',
    ]);

    return { ...existingRole, ...updatedRole };
  }

  public async deleteRole(
    roleId: string,
    workspaceId: string,
  ): Promise<string> {
    await this.validateRoleIsEditableOrThrow({
      roleId,
      workspaceId,
    });

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    const defaultRoleId = workspace?.defaultRoleId;

    if (!isDefined(defaultRoleId)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.DEFAULT_ROLE_NOT_FOUND,
        PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND,
        {
          userFriendlyMessage: msg`The default role for this workspace could not be found. Please contact support for assistance.`,
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

    await this.workspaceCacheService.invalidate(workspaceId, [
      'rolesPermissions',
    ]);

    return roleId;
  }

  public async createMemberRole({
    workspaceId,
    applicationId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<RoleEntity> {
    const id = v4();

    return this.roleRepository.save({
      label: MEMBER_ROLE_LABEL,
      description: 'Member role',
      icon: 'IconUser',
      canUpdateAllSettings: false,
      canAccessAllTools: true,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      canBeAssignedToUsers: true,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
      isEditable: true,
      workspaceId,
      applicationId,
      id,
      universalIdentifier: id,
    });
  }

  // Only used for dev seeding and testing
  public async createGuestRole({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<RoleEntity> {
    const id = v4();

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
      canBeAssignedToUsers: true,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
      isEditable: false,
      workspaceId,
      applicationId,
      id,
      universalIdentifier: id,
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
            userFriendlyMessage: msg`Some of the information provided is invalid. Please check your input and try again.`,
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
          { userFriendlyMessage: msg`A role with this label already exists.` },
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
          userFriendlyMessage: msg`You cannot grant edit permissions without also granting read permissions. Please enable read access first.`,
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
          userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
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
          userFriendlyMessage: msg`The default role cannot be deleted as it is required for the workspace to function properly.`,
        },
      );
    }
  }
}
