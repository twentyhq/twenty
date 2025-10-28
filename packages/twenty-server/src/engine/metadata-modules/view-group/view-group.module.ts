import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ViewGroupController } from 'src/engine/metadata-modules/view-group/controllers/view-group.controller';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewGroupResolver } from 'src/engine/metadata-modules/view-group/resolvers/view-group.resolver';
import { ViewGroupV2Service } from 'src/engine/metadata-modules/view-group/services/view-group-v2.service';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewGroupEntity]),
    WorkspaceCacheStorageModule,
    FeatureFlagModule,
    WorkspaceMigrationV2Module,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [ViewGroupController],
  providers: [ViewGroupService, ViewGroupV2Service, ViewGroupResolver],
  exports: [ViewGroupService],
})
export class ViewGroupModule {}
