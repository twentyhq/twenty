import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceApiKeyRoleMapCacheService } from 'src/engine/metadata-modules/role-target/services/workspace-api-key-role-map-cache.service';
import { WorkspaceUserWorkspaceRoleMapCacheService } from 'src/engine/metadata-modules/role-target/services/workspace-user-workspace-role-map-cache.service';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

import { RoleTargetService } from './services/role-target.service';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
  ],
  providers: [
    RoleTargetService,
    WorkspaceUserWorkspaceRoleMapCacheService,
    WorkspaceApiKeyRoleMapCacheService,
  ],
  exports: [RoleTargetService],
})
export class RoleTargetModule {}
