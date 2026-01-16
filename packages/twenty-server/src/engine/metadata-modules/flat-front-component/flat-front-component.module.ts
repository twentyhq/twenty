import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatFrontComponentMapCacheService } from 'src/engine/metadata-modules/flat-front-component/services/workspace-flat-front-component-map-cache.service';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FrontComponentEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceFlatFrontComponentMapCacheService],
  exports: [WorkspaceFlatFrontComponentMapCacheService],
})
export class FlatFrontComponentModule {}
