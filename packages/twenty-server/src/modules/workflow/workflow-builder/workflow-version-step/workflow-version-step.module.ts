import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowAiAgentStepAgentService } from 'src/modules/workflow/workflow-builder/workflow-version-step/services/workflow-ai-agent-step-agent.service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';

@Module({
  imports: [
    WorkflowSchemaModule,
    WorkflowCommonModule,
    FeatureFlagModule,
    AiAgentModule,
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([ObjectMetadataEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkflowVersionCoreModule,
    RecordCrudModule,
  ],
  providers: [
    WorkflowVersionStepOperationsWorkspaceService,
    WorkflowAiAgentStepAgentService,
    provideWorkspaceScopedRepository(ObjectMetadataEntity),
  ],
  exports: [
    WorkflowVersionStepOperationsWorkspaceService,
    WorkflowAiAgentStepAgentService,
  ],
})
export class WorkflowVersionStepModule {}
