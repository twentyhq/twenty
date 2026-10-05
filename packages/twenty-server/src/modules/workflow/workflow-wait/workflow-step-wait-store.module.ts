import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowStepWaitEntity } from 'src/engine/core-modules/workflow/entities/workflow-step-wait.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowStepWaitEntity])],
  providers: [
    WorkflowStepWaitWorkspaceService,
    provideWorkspaceScopedRepository(WorkflowStepWaitEntity),
  ],
  exports: [WorkflowStepWaitWorkspaceService],
})
export class WorkflowStepWaitStoreModule {}
