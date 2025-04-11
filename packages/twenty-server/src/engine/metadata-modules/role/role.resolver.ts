import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
import { UpsertObjectPermissionInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permission-input';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { UpdateRoleInput } from 'src/engine/metadata-modules/role/dtos/update-role-input.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { SettingPermissionDTO } from 'src/engine/metadata-modules/setting-permission/dtos/setting-permission.dto';
import { UpsertSettingPermissionsInput } from 'src/engine/metadata-modules/setting-permission/dtos/upsert-setting-permission-input';
import { SettingPermissionService } from 'src/engine/metadata-modules/setting-permission/setting-permission.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Resolver(() => RoleDTO)
@UseGuards(SettingsPermissionsGuard(SettingPermissionType.ROLES))
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class RoleResolver {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly roleService: RoleService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly settingPermissionService: SettingPermissionService,
  ) {}

  @Query(() => [RoleDTO])
  async getRoles(@AuthWorkspace() workspace: Workspace): Promise<RoleDTO[]> {
    return this.roleService.getWorkspaceRoles(workspace.id);
  }

  @Mutation(() => WorkspaceMember)
  async updateWorkspaceMemberRole(
    @AuthWorkspace() workspace: Workspace,
    @Args('workspaceMemberId') workspaceMemberId: string,
    @Args('roleId', { type: () => String }) roleId: string,
    @AuthWorkspaceMemberId()
    updatorWorkspaceMemberId: string,
  ): Promise<WorkspaceMember> {
    if (updatorWorkspaceMemberId === workspaceMemberId) {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_UPDATE_SELF_ROLE,
        PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE,
      );
    }

    const workspaceMember =
      await this.userWorkspaceService.getWorkspaceMemberOrThrow({
        workspaceMemberId,
        workspaceId: workspace.id,
      });

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: workspaceMember.userId,
        workspaceId: workspace.id,
      });

    await this.userRoleService.assignRoleToUserWorkspace({
      userWorkspaceId: userWorkspace.id,
      workspaceId: workspace.id,
      roleId,
    });

    const roles = await this.userRoleService
      .getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspace.id],
        workspaceId: workspace.id,
      })
      .then(
        (rolesByUserWorkspaces) =>
          rolesByUserWorkspaces?.get(userWorkspace.id) ?? [],
      );

    return {
      ...workspaceMember,
      userWorkspaceId: userWorkspace.id,
      roles,
    } as WorkspaceMember;
  }

  @Mutation(() => RoleDTO)
  async createOneRole(
    @AuthWorkspace() workspace: Workspace,
    @Args('createRoleInput') createRoleInput: CreateRoleInput,
  ): Promise<RoleDTO> {
    await this.validatePermissionsV2EnabledOrThrow(workspace);

    return await this.roleService.createRole({
      workspaceId: workspace.id,
      input: createRoleInput,
    });
  }

  @Mutation(() => RoleDTO)
  async updateOneRole(
    @AuthWorkspace() workspace: Workspace,
    @Args('updateRoleInput') updateRoleInput: UpdateRoleInput,
  ): Promise<RoleDTO> {
    await this.validatePermissionsV2EnabledOrThrow(workspace);

    const role = await this.roleService.updateRole({
      input: updateRoleInput,
      workspaceId: workspace.id,
    });

    return role;
  }

  @Mutation(() => String)
  async deleteOneRole(
    @AuthWorkspace() workspace: Workspace,
    @Args('roleId') roleId: string,
  ): Promise<string> {
    await this.validatePermissionsV2EnabledOrThrow(workspace);

    const deletedRoleId = await this.roleService.deleteRole(
      roleId,
      workspace.id,
    );

    return deletedRoleId;
  }

  @Mutation(() => ObjectPermissionDTO)
  async upsertOneObjectPermission(
    @AuthWorkspace() workspace: Workspace,
    @Args('upsertObjectPermissionInput')
    upsertObjectPermissionInput: UpsertObjectPermissionInput,
  ) {
    await this.validatePermissionsV2EnabledOrThrow(workspace);

    const objectPermission =
      await this.objectPermissionService.upsertObjectPermission({
        workspaceId: workspace.id,
        input: upsertObjectPermissionInput,
      });

    return objectPermission;
  }

  @Mutation(() => [SettingPermissionDTO])
  async upsertSettingPermissions(
    @AuthWorkspace() workspace: Workspace,
    @Args('upsertSettingPermissionsInput')
    upsertSettingPermissionsInput: UpsertSettingPermissionsInput,
  ) {
    await this.validatePermissionsV2EnabledOrThrow(workspace);

    return this.settingPermissionService.upsertSettingPermissions({
      workspaceId: workspace.id,
      input: upsertSettingPermissionsInput,
    });
  }

  @ResolveField('workspaceMembers', () => [WorkspaceMember])
  async getWorkspaceMembersAssignedToRole(
    @Parent() role: RoleDTO,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<WorkspaceMemberWorkspaceEntity[]> {
    return this.userRoleService.getWorkspaceMembersAssignedToRole(
      role.id,
      workspace.id,
    );
  }

  private async validatePermissionsV2EnabledOrThrow(workspace: Workspace) {
    const isPermissionsV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsPermissionsV2Enabled,
        workspace.id,
      );

    if (!isPermissionsV2Enabled) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSIONS_V2_NOT_ENABLED,
        PermissionsExceptionCode.PERMISSIONS_V2_NOT_ENABLED,
      );
    }
  }
}
