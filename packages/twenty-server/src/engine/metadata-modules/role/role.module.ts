import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileModule } from 'src/engine/core-modules/file/file.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentRoleModule } from 'src/engine/metadata-modules/agent-role/agent-role.module';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleResolver } from 'src/engine/metadata-modules/role/role.resolver';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { SettingPermissionModule } from 'src/engine/metadata-modules/setting-permission/setting-permission.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, RoleTargetsEntity], 'core'),
    TypeOrmModule.forFeature([UserWorkspace, Workspace], 'core'),
    UserRoleModule,
    AgentRoleModule,
    PermissionsModule,
    UserWorkspaceModule,
    ObjectPermissionModule,
    SettingPermissionModule,
    WorkspacePermissionsCacheModule,
    FileModule,
  ],
  providers: [RoleService, RoleResolver],
  exports: [RoleService],
})
export class RoleModule {}
