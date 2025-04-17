import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleResolver } from 'src/engine/metadata-modules/role/role.resolver';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { SettingPermissionModule } from 'src/engine/metadata-modules/setting-permission/setting-permission.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, UserWorkspaceRoleEntity], 'metadata'),
    TypeOrmModule.forFeature([UserWorkspace, Workspace], 'core'),
    UserRoleModule,
    PermissionsModule,
    UserWorkspaceModule,
    FeatureFlagModule,
    ObjectPermissionModule,
    SettingPermissionModule,
    WorkspacePermissionsCacheModule,
  ],
  providers: [RoleService, RoleResolver],
  exports: [RoleService],
})
export class RoleModule {}
