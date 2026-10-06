import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiAgentRoleModule } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { CodeStepBuildModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/code-step-build.module';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';

@Module({
  imports: [
    WorkflowSchemaModule,
    LogicFunctionModule,
    WorkflowCommonModule,
    CodeStepBuildModule,
    FeatureFlagModule,
    AiAgentRoleModule,
    AiAgentModule,
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([
      ObjectMetadataEntity,
      RoleTargetEntity,
      WorkspaceEntity,
    ]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    RecordCrudModule,
  ],
  providers: [
    WorkflowVersionStepOperationsWorkspaceService,
    provideWorkspaceScopedRepository(RoleTargetEntity),
    provideWorkspaceScopedRepository(ObjectMetadataEntity),
  ],
  exports: [WorkflowVersionStepOperationsWorkspaceService],
})
export class WorkflowVersionStepModule {}
