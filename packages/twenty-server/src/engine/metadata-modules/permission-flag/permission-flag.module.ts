import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatPermissionFlagModule } from 'src/engine/metadata-modules/flat-permission-flag/flat-permission-flag.module';
import { PermissionFlagResolver } from 'src/engine/metadata-modules/permission-flag/permission-flag.resolver';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    WorkspaceCacheStorageModule,
    ApplicationModule,
    FeatureFlagModule,
    FlatPermissionFlagModule,
    PermissionsModule,
  ],
  providers: [
    PermissionFlagService,
    PermissionFlagResolver,
  ],
  exports: [PermissionFlagService],
})
export class PermissionFlagModule {}
