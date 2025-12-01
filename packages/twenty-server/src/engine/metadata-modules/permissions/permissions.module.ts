import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      RoleTargetsEntity,
      ApiKeyEntity,
      WorkspaceEntity,
    ]),
    FeatureFlagModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    UserRoleModule,
    WorkspacePermissionsCacheModule,
    WorkspaceCacheModule,
    RoleTargetModule,
  ],
  providers: [ApiKeyRoleService, PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
