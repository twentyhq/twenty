import { Module } from '@nestjs/common';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { RecordShareModule } from 'src/engine/core-modules/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowExecutionContextModule } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.module';
import { WorkflowExecutorModule } from 'src/modules/workflow/workflow-executor/workflow-executor.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowStepWaitSweepCronCommand } from 'src/modules/workflow/workflow-wait/crons/commands/workflow-step-wait-sweep.cron.command';
import { WorkflowStepWaitSweepCronJob } from 'src/modules/workflow/workflow-wait/crons/jobs/workflow-step-wait-sweep.cron.job';
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
    WorkflowExecutionContextModule,
    RecordCrudModule,
  ],
  providers: [
    WorkflowStepWaitResolverWorkspaceService,
    ResumeWaitingWorkflowStepJob,
    WorkflowStepWaitDatabaseEventListener,
    WorkflowStepWaitSweepCronJob,
    WorkflowStepWaitSweepCronCommand,
  ],
  exports: [WorkflowStepWaitSweepCronCommand],
})
export class WorkflowWaitModule {}
