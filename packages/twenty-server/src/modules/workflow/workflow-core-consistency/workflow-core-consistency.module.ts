import { Module } from '@nestjs/common';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowCoreConsistencyCronCommand } from 'src/modules/workflow/workflow-core-consistency/crons/commands/workflow-core-consistency-cron.command';
import { WorkflowCoreConsistencyCronJob } from 'src/modules/workflow/workflow-core-consistency/crons/jobs/workflow-core-consistency-cron.job';
import { WorkflowCoreConsistencyService } from 'src/modules/workflow/workflow-core-consistency/services/workflow-core-consistency.service';

@Module({
  imports: [MetricsModule, WorkspaceCacheModule],
  providers: [
    WorkflowCoreConsistencyService,
    WorkflowCoreConsistencyCronJob,
    WorkflowCoreConsistencyCronCommand,
  ],
  exports: [WorkflowCoreConsistencyCronCommand],
})
export class WorkflowCoreConsistencyModule {}
