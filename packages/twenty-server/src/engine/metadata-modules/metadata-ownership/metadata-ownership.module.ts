import { Module } from '@nestjs/common';

import { WorkspaceViewOwnershipIndexCacheService } from 'src/engine/metadata-modules/metadata-ownership/services/workspace-view-ownership-index-cache.service';
import { WorkspaceWorkflowOwnershipIndexCacheService } from 'src/engine/metadata-modules/metadata-ownership/services/workspace-workflow-ownership-index-cache.service';

@Module({
  providers: [
    WorkspaceViewOwnershipIndexCacheService,
    WorkspaceWorkflowOwnershipIndexCacheService,
  ],
})
export class MetadataOwnershipModule {}
