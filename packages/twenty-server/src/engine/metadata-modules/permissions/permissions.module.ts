import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      RoleTargetEntity,
      ApiKeyEntity,
      WorkspaceEntity,
    ]),
    FeatureFlagModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    UserRoleModule,
    WorkspaceCacheModule,
    RoleTargetModule,
  ],
  providers: [ApiKeyRoleService, PermissionsService],
  exports: [PermissionsService, ApiKeyRoleService],
})
export class PermissionsModule {}
