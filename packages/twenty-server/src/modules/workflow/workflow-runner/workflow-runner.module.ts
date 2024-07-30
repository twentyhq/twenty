import { Module } from '@nestjs/common';

import { WorkflowRunService } from 'src/modules/workflow/workflow-runner/services/workflow-run.service';
import { WorkflowRunJob } from 'src/modules/workflow/workflow-runner/jobs/workflow-run.job';

@Module({ providers: [WorkflowRunService, WorkflowRunJob] })
export class WorkflowRunnerModule {}
