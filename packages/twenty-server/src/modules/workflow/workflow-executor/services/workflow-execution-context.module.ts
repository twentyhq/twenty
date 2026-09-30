import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    ApplicationModule,
    RoleModule,
    UserRoleModule,
    UserWorkspaceModule,
    WorkflowRunModule,
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  providers: [WorkflowExecutionContextService],
  exports: [WorkflowExecutionContextService],
})
export class WorkflowExecutionContextModule {}
