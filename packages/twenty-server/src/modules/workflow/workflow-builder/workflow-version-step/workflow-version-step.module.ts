import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AiAgentRoleModule } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { CodeStepBuildModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/code-step-build.module';
import { WorkflowVersionStepCreationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-creation.workspace-service';
import { WorkflowVersionStepDeletionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-deletion.workspace-service';
import { WorkflowVersionStepHelpersWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-helpers.workspace-service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { WorkflowVersionStepUpdateWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-update.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';

@Module({
  imports: [
    WorkflowSchemaModule,
    LogicFunctionModule,
    WorkflowCommonModule,
    CodeStepBuildModule,
    AiAgentRoleModule,
    WorkspaceCacheModule,
    NestjsQueryTypeOrmModule.forFeature([
      ObjectMetadataEntity,
      AgentEntity,
      RoleTargetEntity,
      RoleEntity,
    ]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
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
    WorkflowVersionStepHelpersWorkspaceService,
  ],
})
export class WorkflowVersionStepModule {}
