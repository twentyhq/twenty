import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { SearchableFieldMetadataIdsService } from 'src/engine/metadata-modules/flat-search-field-metadata/services/searchable-field-metadata-ids.service';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchFieldMetadataEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [SearchableFieldMetadataIdsService],
  exports: [SearchableFieldMetadataIdsService],
})
export class SearchFieldMetadataModule {}
