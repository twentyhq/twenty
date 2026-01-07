import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewFilterGroupController } from 'src/engine/metadata-modules/view-filter-group/controllers/view-filter-group.controller';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterGroupResolver } from 'src/engine/metadata-modules/view-filter-group/resolvers/view-filter-group.resolver';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewPermissionsModule } from 'src/engine/metadata-modules/view-permissions/view-permissions.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewFilterGroupEntity, ViewEntity]),
    PermissionsModule,
    WorkspaceCacheStorageModule,
    ApplicationModule,
    WorkspaceMigrationV2Module,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ViewPermissionsModule,
  ],
  controllers: [ViewFilterGroupController],
  providers: [ViewFilterGroupService, ViewFilterGroupResolver],
  exports: [ViewFilterGroupService],
})
export class ViewFilterGroupModule {}
