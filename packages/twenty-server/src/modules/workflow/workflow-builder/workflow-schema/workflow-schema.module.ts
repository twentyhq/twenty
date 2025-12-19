import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';

@Module({
  imports: [
    WorkflowCommonModule,
    FeatureFlagModule,
    TypeOrmModule.forFeature([AgentEntity]),
  ],
  providers: [WorkflowSchemaWorkspaceService],
  exports: [WorkflowSchemaWorkspaceService],
})
export class WorkflowSchemaModule {}
