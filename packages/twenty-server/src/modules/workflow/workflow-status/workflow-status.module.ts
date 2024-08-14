import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowStatusService } from 'src/modules/workflow/workflow-status/workflow-status.service';

@Module({
  imports: [TwentyORMModule.forFeature([WorkflowRunWorkspaceEntity])],
  providers: [WorkflowStatusService],
  exports: [WorkflowStatusService],
})
export class WorkflowStatusModule {}
