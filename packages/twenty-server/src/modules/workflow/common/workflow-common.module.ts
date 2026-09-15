import { Module } from '@nestjs/common';

import { CommandMenuItemModule } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkflowQueryHookModule } from 'src/modules/workflow/common/query-hooks/workflow-query-hook.module';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';

@Module({
  imports: [
    WorkflowQueryHookModule,
    LogicFunctionModule,
    CommandMenuItemModule,
    FeatureFlagModule,
    WorkflowVersionCoreModule,
    WorkflowMetadataReadModule,
  ],
  providers: [WorkflowCommonWorkspaceService],
  exports: [WorkflowCommonWorkspaceService],
})
export class WorkflowCommonModule {}
