import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';

@Module({
  imports: [WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [WorkflowMetadataReadService],
  exports: [WorkflowMetadataReadService],
})
export class WorkflowMetadataReadModule {}
