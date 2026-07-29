import { Module } from '@nestjs/common';

import { CommandMenuItemModule } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkflowQueryHookModule } from 'src/modules/workflow/common/query-hooks/workflow-query-hook.module';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@Module({
  imports: [
    WorkflowQueryHookModule,
    LogicFunctionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    CommandMenuItemModule,
    FeatureFlagModule,
    WorkflowVersionCoreModule,
  ],
  providers: [WorkflowCommonWorkspaceService],
  exports: [WorkflowCommonWorkspaceService],
})
export class WorkflowCommonModule {}
