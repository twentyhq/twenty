import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { WorkflowEventTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-event-trigger.job';
import { DatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/listeners/database-event-trigger.listener';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workflow-trigger.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkflowRunnerModule, FeatureFlagModule],
  providers: [
    WorkflowTriggerWorkspaceService,
    ScopedWorkspaceContextFactory,
    DatabaseEventTriggerListener,
    WorkflowEventTriggerJob,
  ],
  exports: [WorkflowTriggerWorkspaceService],
})
export class WorkflowTriggerModule {}
