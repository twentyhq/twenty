import { Query, Resolver } from '@nestjs/graphql';

import { SettingsFeatures } from 'twenty-shared';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { permissionsGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception-handler';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';

@Resolver()
export class PermissionsResolver {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly roleService: RoleService,
  ) {}

  @Query(() => [RoleDTO])
  async getRoles(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<RoleDTO[]> {
    try {
      await this.permissionsService.validatesUserHasWorkspaceSettingPermissionOrThrow(
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
}
