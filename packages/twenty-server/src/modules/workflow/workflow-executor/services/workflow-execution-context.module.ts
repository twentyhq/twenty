import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { WorkflowRunApplicationsService } from 'src/modules/workflow/workflow-executor/services/workflow-run-applications.service';
import { WorkflowRunChangeAuthorizationWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-run-change-authorization.workspace-service';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    ApplicationModule,
    PermissionsModule,
    RoleModule,
    UserRoleModule,
    UserWorkspaceModule,
    WorkflowRunModule,
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([WorkspaceEntity, WorkflowEntity]),
  ],
  providers: [
    WorkflowExecutionContextService,
    WorkflowRunApplicationsService,
    WorkflowRunChangeAuthorizationWorkspaceService,
    provideWorkspaceScopedRepository(WorkflowEntity),
  ],
  exports: [
    WorkflowExecutionContextService,
    WorkflowRunChangeAuthorizationWorkspaceService,
  ],
})
export class WorkflowExecutionContextModule {}
