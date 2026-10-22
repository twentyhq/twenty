import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { AssignRoleToWorkspaceMemberTool } from 'src/engine/metadata-modules/role/tools/assign-role-to-workspace-member.tool';
import { CreateRoleTool } from 'src/engine/metadata-modules/role/tools/create-role.tool';
import { DeleteRoleTool } from 'src/engine/metadata-modules/role/tools/delete-role.tool';
import { ListRolesTool } from 'src/engine/metadata-modules/role/tools/list-roles.tool';
import { UpdateRoleTool } from 'src/engine/metadata-modules/role/tools/update-role.tool';
import { UpsertObjectPermissionsTool } from 'src/engine/metadata-modules/role/tools/upsert-object-permissions.tool';
import { UpsertRowLevelPermissionRulesTool } from 'src/engine/metadata-modules/role/tools/upsert-row-level-permission-rules.tool';
import { RowLevelPermissionModule } from 'src/engine/metadata-modules/row-level-permission-predicate/row-level-permission.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';

@Module({
  imports: [
    RoleModule,
    UserRoleModule,
    ObjectPermissionModule,
    RowLevelPermissionModule,
    ApplicationModule,
  ],
  providers: [
    ListRolesTool,
    CreateRoleTool,
    UpdateRoleTool,
    DeleteRoleTool,
    AssignRoleToWorkspaceMemberTool,
    UpsertObjectPermissionsTool,
    UpsertRowLevelPermissionRulesTool,
  ],
})
export class RoleToolsModule {}
