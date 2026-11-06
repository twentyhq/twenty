import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunFindOnePostQueryHook } from 'src/modules/workflow/workflow-builder/workflow-schema/query-hooks/workflow-run-find-one.post-query.hook';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [WorkflowSchemaWorkspaceService, WorkflowRunFindOnePostQueryHook],
  exports: [WorkflowSchemaWorkspaceService],
})
export class WorkflowSchemaModule {}
