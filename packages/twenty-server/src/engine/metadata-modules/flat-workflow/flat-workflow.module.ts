import { Module } from '@nestjs/common';

import { WorkspaceFlatWorkflowMapCacheService } from 'src/engine/metadata-modules/flat-workflow/services/workspace-flat-workflow-map-cache.service';

@Module({
  providers: [WorkspaceFlatWorkflowMapCacheService],
  exports: [WorkspaceFlatWorkflowMapCacheService],
})
export class FlatWorkflowModule {}
