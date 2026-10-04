import { Module } from '@nestjs/common';

import { RecordShareModule } from 'src/engine/core-modules/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { ResumeWaitingWorkflowStepJob } from 'src/modules/workflow/workflow-wait/jobs/resume-waiting-workflow-step.job';
import { WorkflowStepWaitDatabaseEventListener } from 'src/modules/workflow/workflow-wait/listeners/workflow-step-wait-database-event.listener';
import { WorkflowStepWaitResolverWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait-resolver.workspace-service';
import { WorkflowStepWaitStoreModule } from 'src/modules/workflow/workflow-wait/workflow-step-wait-store.module';

@Module({
  imports: [
    WorkflowStepWaitStoreModule,
    WorkflowExecutorModule,
    WorkflowRunModule,
    RecordShareModule,
    WorkspaceCacheModule,
  ],
  providers: [
    WorkflowStepWaitResolverWorkspaceService,
    ResumeWaitingWorkflowStepJob,
    WorkflowStepWaitDatabaseEventListener,
  ],
})
export class WorkflowWaitModule {}
