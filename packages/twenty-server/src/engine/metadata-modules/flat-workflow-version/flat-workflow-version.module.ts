import { Module } from '@nestjs/common';

import { WorkspaceFlatWorkflowVersionMapCacheService } from 'src/engine/metadata-modules/flat-workflow-version/services/workspace-flat-workflow-version-map-cache.service';

@Module({
  providers: [WorkspaceFlatWorkflowVersionMapCacheService],
})
export class FlatWorkflowVersionModule {}
