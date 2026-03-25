import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';

@Module({
  imports: [
    WorkflowSchemaModule,
    LogicFunctionModule,
    WorkflowVersionStepModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity]),
    RecordPositionModule,
    CacheLockModule,
  ],
  providers: [WorkflowVersionWorkspaceService],
  exports: [WorkflowVersionWorkspaceService],
})
export class WorkflowVersionModule {}
