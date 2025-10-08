import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ViewEntity,
      ViewFieldEntity,
      ViewFilterEntity,
      ViewFilterGroupEntity,
      ViewGroupEntity,
      ViewSortEntity,
    ]),
    TypeOrmModule.forFeature([ObjectMetadataEntity]),
    FeatureFlagModule,
  ],

  providers: [],
  exports: [],
})
export class ViewModule {}
