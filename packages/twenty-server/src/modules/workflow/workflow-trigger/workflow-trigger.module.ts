import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { CommandMenuItemModule } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { CodeStepBuildModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/code-step-build.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { AutomatedTriggerModule } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.module';
import { WorkflowTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Module({
  imports: [
    WorkflowCommonModule,
    CodeStepBuildModule,
    WorkflowRunnerModule,
    AutomatedTriggerModule,
    CommandMenuItemModule,
    FeatureFlagModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity]),
    LogicFunctionModule,
  ],
  providers: [WorkflowTriggerWorkspaceService, WorkflowTriggerJob],
  exports: [WorkflowTriggerWorkspaceService],
})
export class WorkflowTriggerModule {}
