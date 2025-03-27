import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkflowRunListener } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.listener';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Module({
  imports: [
    WorkflowCommonModule,
    SubscriptionsModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
  ],
  providers: [
    WorkflowRunWorkspaceService,
    WorkflowRunListener,
    ScopedWorkspaceContextFactory,
  ],
  exports: [WorkflowRunWorkspaceService],
})
export class WorkflowRunModule {}
