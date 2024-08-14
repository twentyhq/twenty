import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowStatusWorkspaceService } from 'src/modules/workflow/workflow-status/workflow-status.workspace-service';

@Module({
  imports: [TwentyORMModule.forFeature([WorkflowRunWorkspaceEntity])],
  providers: [WorkflowStatusWorkspaceService],
  exports: [WorkflowStatusWorkspaceService],
})
export class WorkflowStatusModule {}
