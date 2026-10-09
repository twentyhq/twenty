import { Module } from '@nestjs/common';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';

@Module({
  imports: [
    WorkflowVersionStepModule,
    WorkflowCommonModule,
    RecordPositionModule,
    CacheLockModule,
    WorkflowCoreModule,
    WorkflowVersionCoreModule,
  ],
  providers: [WorkflowVersionWorkspaceService],
  exports: [WorkflowVersionWorkspaceService],
})
export class WorkflowVersionModule {}
