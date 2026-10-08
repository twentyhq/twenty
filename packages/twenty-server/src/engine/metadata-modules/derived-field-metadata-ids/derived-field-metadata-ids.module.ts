import { Module } from '@nestjs/common';

import { DerivedFieldMetadataIdsService } from 'src/engine/metadata-modules/derived-field-metadata-ids/services/derived-field-metadata-ids.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

@Module({
  imports: [WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [DerivedFieldMetadataIdsService],
  exports: [DerivedFieldMetadataIdsService],
})
export class DerivedFieldMetadataIdsModule {}
