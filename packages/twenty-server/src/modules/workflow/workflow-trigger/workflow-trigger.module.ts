import { Module } from '@nestjs/common';

import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';

import { WorkflowVersionValidationModule } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.module';

import { CommandMenuItemModule } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { CodeStepBuildModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/code-step-build.module';
import { WorkflowCoreConsistencyModule } from 'src/modules/workflow/workflow-core-consistency/workflow-core-consistency.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { AutomatedTriggerModule } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.module';
import { WorkflowTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Module({
  imports: [
    WorkflowCoreModule,
    WorkflowCommonModule,
    CodeStepBuildModule,
    WorkflowRunnerModule,
    AutomatedTriggerModule,
    WorkflowCoreConsistencyModule,
    CommandMenuItemModule,
    WorkflowVersionCoreModule,
    WorkflowVersionValidationModule,
  ],
  providers: [WorkflowTriggerWorkspaceService, WorkflowTriggerJob],
  exports: [WorkflowTriggerWorkspaceService],
})
export class WorkflowTriggerModule {}
