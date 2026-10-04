import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowStepWaitEntity } from 'src/engine/core-modules/workflow/entities/workflow-step-wait.entity';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowStepWaitEntity])],
  providers: [WorkflowStepWaitWorkspaceService],
  exports: [WorkflowStepWaitWorkspaceService],
})
export class WorkflowStepWaitStoreModule {}
