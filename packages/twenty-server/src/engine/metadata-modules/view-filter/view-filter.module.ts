import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewFilterController } from 'src/engine/metadata-modules/view-filter/controllers/view-filter.controller';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewFilterResolver } from 'src/engine/metadata-modules/view-filter/resolvers/view-filter.resolver';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewPermissionsModule } from 'src/engine/metadata-modules/view-permissions/view-permissions.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewFilterEntity, ViewEntity]),
    WorkspaceCacheStorageModule,
    ApplicationModule,
    PermissionsModule,
    WorkspaceMigrationV2Module,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ViewPermissionsModule,
  ],
  controllers: [ViewFilterController],
  providers: [ViewFilterService, ViewFilterResolver],
  exports: [ViewFilterService],
})
export class ViewFilterModule {}
