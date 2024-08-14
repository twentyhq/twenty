import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { WorkflowStatusModule } from 'src/modules/workflow/workflow-status/workflow-status.module';
import { WorkflowEventTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-event-trigger.job';

@Module({
  imports: [
    WorkflowRunnerModule,
    WorkflowStatusModule,
    TwentyORMModule.forFeature([WorkflowWorkspaceEntity]),
  ],
  providers: [WorkflowEventTriggerJob],
})
export class WorkflowTriggerJobModule {}
