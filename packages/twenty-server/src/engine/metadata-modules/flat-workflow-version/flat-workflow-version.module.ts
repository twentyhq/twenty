import { Module } from '@nestjs/common';

import { WorkspaceCoreWorkflowVersionsByCoreWorkflowIdCacheService } from 'src/engine/metadata-modules/flat-workflow-version/services/workspace-core-workflow-versions-by-core-workflow-id-cache.service';
import { WorkspaceFlatWorkflowVersionMapCacheService } from 'src/engine/metadata-modules/flat-workflow-version/services/workspace-flat-workflow-version-map-cache.service';

@Module({
  providers: [
    WorkspaceFlatWorkflowVersionMapCacheService,
    WorkspaceCoreWorkflowVersionsByCoreWorkflowIdCacheService,
  ],
})
export class FlatWorkflowVersionModule {}
