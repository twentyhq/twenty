import { Module } from '@nestjs/common';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowSchemaModule } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.module';
import { WorkflowVersionStepModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.module';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';

@Module({
  imports: [
    WorkflowSchemaModule,
    LogicFunctionModule,
    WorkflowVersionStepModule,
    WorkflowCommonModule,
    RecordPositionModule,
    CacheLockModule,
    WorkflowVersionCoreModule,
  ],
  providers: [WorkflowVersionWorkspaceService],
  exports: [WorkflowVersionWorkspaceService],
})
export class WorkflowVersionModule {}
