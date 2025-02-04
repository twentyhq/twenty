import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { isDefined, SettingsFeatures } from 'twenty-shared';

import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { permissionsGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception-handler';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/userRole/userRole.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Resolver(() => RoleDTO)
export class RoleResolver {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly permissionsService: PermissionsService,
    private readonly roleService: RoleService,
  ) {}

  @Query(() => [RoleDTO])
  async getRoles(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<RoleDTO[]> {
    try {
      await this.permissionsService.validateUserHasWorkspaceSettingPermissionOrThrow(
        {
          userWorkspaceId,
          setting: SettingsFeatures.ROLES,
        },
      );

      const roles = await this.roleService.getWorkspaceRoles(workspace.id);

      return roles.map((role) => ({
        id: role.id,
        label: role.label,
        canUpdateAllSettings: role.canUpdateAllSettings,
        description: role.description,
        workspaceId: role.workspaceId,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        isEditable: role.isEditable,
        userWorkspaceRoles: role.userWorkspaceRoles,
      }));
    } catch (error) {
      return permissionsGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => WorkspaceMember)
  async updateWorkspaceMemberRole(
    @AuthUserWorkspaceId() currentUserWorkspaceId: string,
    @AuthWorkspace() workspace: Workspace,
    @Args('workspaceMemberId') workspaceMemberId: string,
    @Args('roleId', { type: () => String, nullable: true })
    roleId: string | null,
  ): Promise<WorkspaceMember> {
    await this.permissionsService.validateUserHasWorkspaceSettingPermissionOrThrow(
      {
        userWorkspaceId: currentUserWorkspaceId,
        setting: SettingsFeatures.ROLES,
      },
    );

    if (!isDefined(roleId)) {
      return this.userRoleService.unassignRolesFromWorkspaceMember({
        workspaceMemberId,
        workspaceId: workspace.id,
      });
    }

    return this.userRoleService.assignRoleToWorkspaceMember({
      workspaceId: workspace.id,
      workspaceMemberId,
      roleId,
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
}
