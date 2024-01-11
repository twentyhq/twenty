import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FetchAllMessagesFromConnectedAccountJob } from 'src/workspace/messaging/jobs/fetch-all-messages-from-connected-account.job';
import { CallWebhookJobsJob } from 'src/workspace/workspace-query-runner/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/workspace/workspace-query-runner/jobs/call-webhook.job';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { CleanInactiveWorkspaceJob } from 'src/workspace/cron/clean-inactive-workspaces/clean-inactive-workspace.job';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FetchWorkspaceMessagesModule } from 'src/workspace/messaging/services/fetch-workspace-messages.module';
import { EmailSenderJob } from 'src/integrations/email/email-sender.job';
import { UserModule } from 'src/core/user/user.module';
import { WorkspaceModule } from 'src/core/workspace/workspace.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataModule,
    DataSourceModule,
    HttpModule,
    TypeORMModule,
    FetchWorkspaceMessagesModule,
    UserModule,
    WorkspaceModule,
    EnvironmentModule,
    TypeORMModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
  ],
  providers: [
    {
      provide: FetchAllMessagesFromConnectedAccountJob.name,
      useClass: FetchAllMessagesFromConnectedAccountJob,
    },
    {
      provide: CallWebhookJobsJob.name,
      useClass: CallWebhookJobsJob,
    },
    {
      provide: CallWebhookJob.name,
      useClass: CallWebhookJob,
    },
    {
      provide: CleanInactiveWorkspaceJob.name,
      useClass: CleanInactiveWorkspaceJob,
    },
    { provide: EmailSenderJob.name, useClass: EmailSenderJob },
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
