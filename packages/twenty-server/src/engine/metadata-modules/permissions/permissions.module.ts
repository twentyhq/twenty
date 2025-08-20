import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [RoleEntity, RoleTargetsEntity, ApiKey, Workspace],
      'core',
    ),
    FeatureFlagModule,
    TypeOrmModule.forFeature([UserWorkspace], 'core'),
    UserRoleModule,
    WorkspacePermissionsCacheModule,
  ],
  providers: [PermissionsService, ApiKeyRoleService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
