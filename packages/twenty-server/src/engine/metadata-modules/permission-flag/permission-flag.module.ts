import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatPermissionFlagModule } from 'src/engine/metadata-modules/flat-permission-flag/flat-permission-flag.module';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { PermissionFlagResolver } from 'src/engine/metadata-modules/permission-flag/permission-flag.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceCacheStorageModule,
    FlatPermissionFlagModule,
    PermissionsModule,
  ],
  providers: [PermissionFlagService, PermissionFlagResolver],
  exports: [PermissionFlagService],
})
export class PermissionFlagModule {}
