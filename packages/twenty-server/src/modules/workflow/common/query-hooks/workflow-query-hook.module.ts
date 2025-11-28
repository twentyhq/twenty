import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkflowCreateManyPostQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-many.post-query.hook';
import { WorkflowCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-many.pre-query.hook';
import { WorkflowCreateOnePostQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-one.post-query.hook';
import { WorkflowCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-one.pre-query.hook';
import { WorkflowDeleteManyPostQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-delete-many.post-query.hook';
import { WorkflowDeleteOnePostQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-delete-one.post-query.hook';
import { WorkflowDestroyManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-destroy-many.pre-query.hook';
import { WorkflowDestroyOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-destroy-one.pre-query.hook';
import { WorkflowRestoreManyPostQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-restore-many.post-query.hook';
import { WorkflowRestoreOnePostQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-restore-one.post-query.hook';
import { WorkflowRunCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-create-many.pre-query.hook';
import { WorkflowRunCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-create-one.pre-query.hook';
import { WorkflowRunDeleteManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-delete-many.pre-query.hook';
import { WorkflowRunDeleteOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-delete-one.pre-query.hook';
import { WorkflowRunUpdateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-update-many.pre-query.hook';
import { WorkflowRunUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-run-update-one.pre-query.hook';
import { WorkflowUpdateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-update-many.pre-query.hook';
import { WorkflowUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-update-one.pre-query.hook';
import { WorkflowVersionCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-create-many.pre-query.hook';
import { WorkflowVersionCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-create-one.pre-query.hook';
import { WorkflowVersionDeleteManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-delete-many.pre-query.hook';
import { WorkflowVersionDeleteOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-delete-one.pre-query.hook';
import { WorkflowVersionUpdateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-update-many.pre-query.hook';
import { WorkflowVersionUpdateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-version-update-one.pre-query.hook';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-version-validation.workspace-service';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity]),
    ServerlessFunctionModule,
    RecordPositionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ObjectMetadataModule,
  ],
  providers: [
    WorkflowCreateOnePreQueryHook,
    WorkflowCreateManyPreQueryHook,
    WorkflowUpdateOnePreQueryHook,
    WorkflowUpdateManyPreQueryHook,
    WorkflowRunCreateOnePreQueryHook,
    WorkflowRunCreateManyPreQueryHook,
    WorkflowRunUpdateOnePreQueryHook,
    WorkflowRunUpdateManyPreQueryHook,
    WorkflowRunDeleteOnePreQueryHook,
    WorkflowRunDeleteManyPreQueryHook,
    WorkflowRestoreOnePostQueryHook,
    WorkflowRestoreManyPostQueryHook,
    WorkflowVersionCreateOnePreQueryHook,
    WorkflowVersionCreateManyPreQueryHook,
    WorkflowVersionUpdateOnePreQueryHook,
    WorkflowVersionUpdateManyPreQueryHook,
    WorkflowVersionDeleteOnePreQueryHook,
    WorkflowVersionDeleteManyPreQueryHook,
    WorkflowCreateOnePostQueryHook,
    WorkflowCreateManyPostQueryHook,
    WorkflowVersionValidationWorkspaceService,
    WorkflowCommonWorkspaceService,
    WorkflowDeleteManyPostQueryHook,
    WorkflowDeleteOnePostQueryHook,
    WorkflowDestroyOnePreQueryHook,
    WorkflowDestroyManyPreQueryHook,
  ],
})
export class WorkflowQueryHookModule {}
