import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectRecordCountService } from 'src/engine/metadata-modules/object-metadata/object-record-count.service';

@Module({
  imports: [WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [ObjectRecordCountService],
  exports: [ObjectRecordCountService],
})
export class ObjectRecordCountModule {}
