import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { InboxModule } from 'src/engine/core-modules/inbox/inbox.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkflowRunInboxService } from 'src/modules/workflow/workflow-runner/workflow-run/services/workflow-run-inbox.service';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { DeleteWorkflowRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run/command/delete-workflow-runs.command';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Module({
  imports: [
    WorkflowCommonModule,
    RecordPositionModule,
    CacheLockModule,
    MetricsModule,
    WorkspaceIteratorModule,
    FeatureFlagModule,
    InboxModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity, ObjectMetadataEntity]),
  ],
  providers: [
    WorkflowRunWorkspaceService,
    WorkflowRunStepLogWorkspaceService,
    WorkflowRunInboxService,
    DeleteWorkflowRunsCommand,
  ],
  exports: [
    WorkflowRunWorkspaceService,
    WorkflowRunStepLogWorkspaceService,
    DeleteWorkflowRunsCommand,
  ],
})
export class WorkflowRunModule {}
