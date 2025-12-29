import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AiAgentRoleModule } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepCreationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-creation.workspace-service';
import { WorkflowVersionStepDeletionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-deletion.workspace-service';
import { WorkflowVersionStepHelpersWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-helpers.workspace-service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { WorkflowVersionStepUpdateWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-update.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';

@Module({
  imports: [
    WorkflowSchemaModule,
    ServerlessFunctionModule,
    WorkflowCommonModule,
    AiAgentRoleModule,
    WorkspaceCacheModule,
    NestjsQueryTypeOrmModule.forFeature([
      ObjectMetadataEntity,
      AgentEntity,
      RoleTargetEntity,
      RoleEntity,
    ]),
  ],
  providers: [
    WorkflowVersionStepWorkspaceService,
    WorkflowVersionStepOperationsWorkspaceService,
    WorkflowVersionStepHelpersWorkspaceService,
    WorkflowVersionStepCreationWorkspaceService,
    WorkflowVersionStepUpdateWorkspaceService,
    WorkflowVersionStepDeletionWorkspaceService,
  ],
  exports: [
    WorkflowVersionStepWorkspaceService,
    WorkflowVersionStepOperationsWorkspaceService,
  ],
})
export class WorkflowVersionStepModule {}
