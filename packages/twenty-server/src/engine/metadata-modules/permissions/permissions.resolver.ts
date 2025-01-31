import { Query, Resolver } from '@nestjs/graphql';

import { SettingsFeatures } from 'twenty-shared';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';

@Resolver()
export class PermissionsResolver {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly roleService: RoleService,
  ) {}

  @Query(() => [RoleEntity])
  async getRoles(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<RoleEntity[]> {
    await this.permissionsService.validatesUserHasWorkspaceSettingPermissionOrThrow(
      {
        userWorkspaceId,
        setting: SettingsFeatures.ROLES,
      },
    );

    return await this.roleService.getWorkspaceRoles(workspace.id);
  }
}
