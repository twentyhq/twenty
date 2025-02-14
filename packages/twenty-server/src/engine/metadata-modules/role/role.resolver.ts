import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { isDefined, SettingsFeatures } from 'twenty-shared';

import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Resolver(() => RoleDTO)
@UseGuards(SettingsPermissionsGuard(SettingsFeatures.ROLES))
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class RoleResolver {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly roleService: RoleService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  @Query(() => [RoleDTO])
  async getRoles(@AuthWorkspace() workspace: Workspace): Promise<RoleDTO[]> {
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
  }

  @Mutation(() => WorkspaceMember)
  async updateWorkspaceMemberRole(
    @AuthWorkspace() workspace: Workspace,
    @Args('workspaceMemberId') workspaceMemberId: string,
    @Args('roleId', { type: () => String, nullable: true })
    roleId: string | null,
  ): Promise<WorkspaceMember> {
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

    if (!isDefined(roleId)) {
      await this.userRoleService.unassignAllRolesFromUserWorkspace({
        userWorkspaceId: userWorkspace.id,
        workspaceId: workspace.id,
      });
    } else {
      await this.userRoleService.assignRoleToUserWorkspace({
        userWorkspaceId: userWorkspace.id,
        workspaceId: workspace.id,
        roleId,
      });
    }

    const roles = await this.userRoleService
      .getRolesByUserWorkspaces([userWorkspace.id])
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
