import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { Module } from '@nestjs/common';

import { CommandMenuItemModule } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkflowQueryHookModule } from 'src/modules/workflow/common/query-hooks/workflow-query-hook.module';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';

@Module({
  imports: [
    WorkflowCoreModule,
    WorkflowQueryHookModule,
    CommandMenuItemModule,
    WorkflowVersionCoreModule,
    WorkflowMetadataReadModule,
  ],
  providers: [WorkflowCommonWorkspaceService],
  exports: [WorkflowCommonWorkspaceService],
})
export class WorkflowCommonModule {}
