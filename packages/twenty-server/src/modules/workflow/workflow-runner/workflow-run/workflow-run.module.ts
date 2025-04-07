import { Module } from '@nestjs/common';

import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Module({
  imports: [WorkflowCommonModule, RecordPositionModule],
  providers: [WorkflowRunWorkspaceService, ScopedWorkspaceContextFactory],
  exports: [WorkflowRunWorkspaceService],
})
export class WorkflowRunModule {}
