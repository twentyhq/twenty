import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowCreateManyPostQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-many.post-query.hook';
import { WorkflowCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-many.pre-query.hook';
import { WorkflowCreateOnePostQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-one.post-query.hook';
import { WorkflowCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-one.pre-query.hook';
import { WorkflowDeleteManyPostQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-delete-many.post-query.hook';
import { WorkflowDeleteOnePostQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-delete-one.post-query.hook';
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
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    ServerlessFunctionModule,
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
  ],
})
export class WorkflowQueryHookModule {}
