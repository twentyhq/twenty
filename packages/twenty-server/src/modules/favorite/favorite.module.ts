import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FavoriteDeletionJob } from 'src/modules/favorite/jobs/favorite-deletion.job';
import { FavoriteDeletionListener } from 'src/modules/favorite/listeners/favorite-deletion.listener';
import { FavoriteDeletionService } from 'src/modules/favorite/services/favorite-deletion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
  ],
  providers: [
    FavoriteDeletionService,
    FavoriteDeletionListener,
    FavoriteDeletionJob,
  ],
  exports: [],
})
export class FavoriteModule {}
