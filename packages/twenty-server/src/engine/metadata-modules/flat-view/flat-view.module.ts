import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceFlatViewMapCacheService } from 'src/engine/metadata-modules/flat-view/services/workspace-flat-view-map-cache.service';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ViewEntity,
      ViewFieldEntity,
      ViewFilterEntity,
      ViewGroupEntity,
      ViewFilterGroupEntity,
    ]),
  ],
  providers: [WorkspaceFlatViewMapCacheService],
  exports: [WorkspaceFlatViewMapCacheService],
})
export class FlatViewModule {}
