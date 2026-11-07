import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { validateFlatRoleTargetRoleIsEntitled } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-role-target-role-is-entitled.util';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';

@Injectable()
export class RoleAssignmentWriteService {
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly roleTargetService: RoleTargetService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  public async assignRoleToWorkspaceMember({
    workspaceId,
    workspaceMemberId,
    roleId,
    actingUserWorkspaceId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    roleId: string;
    actingUserWorkspaceId?: string;
  }): Promise<{
    workspaceMember: FlatWorkspaceMember;
    userWorkspaceId: string;
  }> {
    const workspaceMember = await this.findWorkspaceMemberByIdOrThrow({
      workspaceMemberId,
      workspaceId,
    });

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId: workspaceMember.userId,
        workspaceId,
      },
    });

    if (!isDefined(userWorkspace)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.USER_WORKSPACE_NOT_FOUND,
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    // Before role validation so a self-assignment reports the self-role error even for an unknown role
    this.validateNotSelfAssignmentOrThrow({
      userWorkspaceIds: [userWorkspace.id],
      actingUserWorkspaceId,
    });

    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
      ]);

    if (userWorkspaceRoleMap[userWorkspace.id] === roleId) {
      return { workspaceMember, userWorkspaceId: userWorkspace.id };
    }

    await this.assertRoleAssignableToUsersOrThrow({ roleId, workspaceId });

    await this.assignRoleToUserWorkspaces({
      workspaceId,
      userWorkspaceIds: [userWorkspace.id],
      roleId,
      actingUserWorkspaceId,
    });

    return { workspaceMember, userWorkspaceId: userWorkspace.id };
  }

  public async assignRoleToUserWorkspaces({
    workspaceId,
    userWorkspaceIds,
    roleId,
    actingUserWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceIds: string[];
    roleId: string;
    actingUserWorkspaceId?: string;
  }): Promise<void> {
    if (userWorkspaceIds.length === 0) {
      return;
    }

    this.validateNotSelfAssignmentOrThrow({
      userWorkspaceIds,
      actingUserWorkspaceId,
    });

    const userWorkspaceIdsToAssign =
      await this.validateAssignRoleInputsAndGetUserWorkspaceIdsToAssign({
        userWorkspaceIds,
        workspaceId,
        roleId,
      });

    if (userWorkspaceIdsToAssign.length === 0) {
      return;
    }

    await this.roleTargetService.createMany({
      createRoleTargetInputs: userWorkspaceIdsToAssign.map(
        (userWorkspaceId) => ({
          roleId,
          targetId: userWorkspaceId,
          targetMetadataForeignKey: 'userWorkspaceId' as const,
        }),
      ),
      workspaceId,
    });
  }

  public async assertRoleAssignableToUsersOrThrow({
    roleId,
    workspaceId,
  }: {
    roleId: string;
    workspaceId: string;
  }): Promise<void> {
    const { flatRoleMaps, billingEntitlements } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleMaps',
        'billingEntitlements',
      ]);

    const role = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: roleId,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(role)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      );
    }

    if (!role.canBeAssignedToUsers) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_CANNOT_BE_ASSIGNED_TO_USERS,
        PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_USERS,
      );
    }

    const entitlementError = validateFlatRoleTargetRoleIsEntitled({
      flatRole: role,
      flatRoleTarget: { agentUniversalIdentifier: null },
      billingEntitlements,
      buildOptions: { isSystemBuild: false },
    });

    if (isDefined(entitlementError)) {
      throw new PermissionsException(
        entitlementError.message,
        PermissionsExceptionCode.CUSTOM_ROLES_NOT_ENTITLED,
        { userFriendlyMessage: entitlementError.userFriendlyMessage },
      );
    }
  }

  private validateNotSelfAssignmentOrThrow({
    userWorkspaceIds,
    actingUserWorkspaceId,
  }: {
    userWorkspaceIds: string[];
    actingUserWorkspaceId?: string;
  }): void {
    if (
      isDefined(actingUserWorkspaceId) &&
      userWorkspaceIds.includes(actingUserWorkspaceId)
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_UPDATE_SELF_ROLE,
        PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE,
        {
          userFriendlyMessage: msg`You cannot change your own role. Please ask another administrator to update your role.`,
        },
      );
    }
  }

  private async findWorkspaceMemberByIdOrThrow({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<FlatWorkspaceMember> {
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);
    const workspaceMember = flatWorkspaceMemberMaps.byId[workspaceMemberId];

    if (!isDefined(workspaceMember) || isDefined(workspaceMember.deletedAt)) {
      throw new PermissionsException(
        'Workspace member not found',
        PermissionsExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    return workspaceMember;
  }

  private async validateAssignRoleInputsAndGetUserWorkspaceIdsToAssign({
    userWorkspaceIds,
    workspaceId,
    roleId,
  }: {
    userWorkspaceIds: string[];
    workspaceId: string;
    roleId: string;
  }): Promise<string[]> {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        id: In(userWorkspaceIds),
      },
    });

    const foundUserWorkspaceIds = new Set(
      userWorkspaces.map((userWorkspace) => userWorkspace.id),
    );

    const missingUserWorkspaceIds = userWorkspaceIds.filter(
      (id) => !foundUserWorkspaceIds.has(id),
    );

    if (missingUserWorkspaceIds.length > 0) {
      throw new PermissionsException(
        `User workspaces not found: ${missingUserWorkspaceIds.join(', ')}`,
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
        {
          userFriendlyMessage: msg`Some workspace memberships could not be found. They may no longer have access to this workspace.`,
        },
      );
    }

    const rolesByUserWorkspaces =
      await this.rolePermissionsService.findRolesByUserWorkspaceIds({
        userWorkspaceIds,
        workspaceId,
      });

    const userWorkspaceIdsToAssign: string[] = [];
    let adminRoleIdToValidate: string | undefined;

    for (const userWorkspaceId of userWorkspaceIds) {
      const currentRole = rolesByUserWorkspaces.get(userWorkspaceId)?.[0];

      if (currentRole?.id === roleId) {
        continue;
      }

      if (
        isDefined(currentRole) &&
        currentRole.universalIdentifier ===
          STANDARD_ROLE.admin.universalIdentifier
      ) {
        adminRoleIdToValidate = currentRole.id;
      }

      userWorkspaceIdsToAssign.push(userWorkspaceId);
    }

    if (isDefined(adminRoleIdToValidate)) {
      await this.validateMoreThanOneWorkspaceMemberHasAdminRoleOrThrow({
        workspaceId,
        adminRoleId: adminRoleIdToValidate,
      });
    }

    return userWorkspaceIdsToAssign;
  }

  public async assertUserWorkspaceIsNotUniqueAdminOrThrow({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }) {
    const roleOfUserWorkspace = await this.rolePermissionsService
      .findRolesByUserWorkspaceIds({
        userWorkspaceIds: [userWorkspaceId],
        workspaceId,
      })
      .then((roles) => roles.get(userWorkspaceId)?.[0]);

    if (!isDefined(roleOfUserWorkspace)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        {
          userFriendlyMessage: msg`Your role in this workspace could not be found. Please contact your workspace administrator.`,
        },
      );
    }

    if (
      roleOfUserWorkspace.universalIdentifier ===
      STANDARD_ROLE.admin.universalIdentifier
    ) {
      const adminRole = roleOfUserWorkspace;

      await this.validateMoreThanOneWorkspaceMemberHasAdminRoleOrThrow({
        adminRoleId: adminRole.id,
        workspaceId,
      });
    }
  }

  private async validateMoreThanOneWorkspaceMemberHasAdminRoleOrThrow({
    adminRoleId,
    workspaceId,
  }: {
    adminRoleId: string;
    workspaceId: string;
  }) {
    const workspaceMembersWithAdminRole =
      await this.findWorkspaceMembersWithRole({
        roleId: adminRoleId,
        workspaceId,
      });

    if (workspaceMembersWithAdminRole.length === 1) {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_UNASSIGN_LAST_ADMIN,
        PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN,
        {
          userFriendlyMessage: msg`You cannot remove the admin role from the last administrator. Please assign another administrator first.`,
        },
      );
    }
  }

  private async findWorkspaceMembersWithRole({
    roleId,
    workspaceId,
  }: {
    roleId: string;
    workspaceId: string;
  }): Promise<FlatWorkspaceMember[]> {
    const { userWorkspaceRoleMap, flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
        'flatWorkspaceMemberMaps',
      ]);

    return Object.entries(userWorkspaceRoleMap)
      .filter(([_, roleIdFromMap]) => roleIdFromMap === roleId)
      .map(([userWorkspaceId]) => {
        const workspaceMemberId =
          flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId];

        return isDefined(workspaceMemberId)
          ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
          : undefined;
      })
      .filter(isDefined);
  }
}
