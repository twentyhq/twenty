import { getDataSourceToken } from '@nestjs/typeorm';
import { BackfillWorkspaceWorkflowVersionIdCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789652804001-backfill-workspace-workflow-version-id.command';
import { type DataSource } from 'typeorm';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type INestApplication } from '@nestjs/common';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { BackfillWorkflowExecutionCoreIdsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789719131001-backfill-workflow-execution-core-ids.command';
import { WorkflowTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowCronTriggerCronJob } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/jobs/workflow-cron-trigger-cron.job';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';

export const createWorkflowTestServices = (app: INestApplication) => ({
  billing: app.get(BillingUsageService),
  coreDataSource: app.get<DataSource>(getDataSourceToken()),
  workspace: app.get(WorkspaceService),
  application: app.get(ApplicationService),
  userWorkspace: app.get(UserWorkspaceService),
  flags: app.get(FeatureFlagService),
  workspaceCache: app.get(WorkspaceCacheService),
  upgradeState: UpgradeAwareRepositoryState.getInstance(),
  backfill: app.get(BackfillWorkflowExecutionCoreIdsCommand),
  versionAliasBackfill: app.get(BackfillWorkspaceWorkflowVersionIdCommand),
  triggerJob: () => app.resolve(WorkflowTriggerJob),
  runJob: () => app.resolve(RunWorkflowJob),
  cron: app.get(WorkflowCronTriggerCronJob),
  throttling: app.get(WorkflowThrottlingWorkspaceService),
});
