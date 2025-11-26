import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AgentRoleModule } from 'src/engine/metadata-modules/agent-role/agent-role.module';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
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
    AgentRoleModule,
    NestjsQueryTypeOrmModule.forFeature([
      ObjectMetadataEntity,
      AgentEntity,
      RoleTargetsEntity,
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
