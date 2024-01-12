import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';

import { GmailFullSyncJob } from 'src/workspace/messaging/jobs/gmail-full-sync.job';
import { CallWebhookJobsJob } from 'src/workspace/workspace-query-runner/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/workspace/workspace-query-runner/jobs/call-webhook.job';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FetchWorkspaceMessagesModule } from 'src/workspace/messaging/services/fetch-workspace-messages.module';
import { GmailPartialSyncJob } from 'src/workspace/messaging/jobs/gmail-partial-sync.job';
import { EmailSenderJob } from 'src/integrations/email/email-sender.job';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataModule,
    DataSourceModule,
    HttpModule,
    TypeORMModule,
    FetchWorkspaceMessagesModule,
  ],
  providers: [
    {
      provide: GmailFullSyncJob.name,
      useClass: GmailFullSyncJob,
    },
    {
      provide: GmailPartialSyncJob.name,
      useClass: GmailPartialSyncJob,
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
      provide: EmailSenderJob.name,
      useClass: EmailSenderJob,
    },
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
