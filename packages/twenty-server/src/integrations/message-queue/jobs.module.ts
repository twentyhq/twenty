import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';

import { FetchAllMessagesFromConnectedAccountJob } from 'src/workspace/messaging/jobs/fetch-all-messages-from-connected-account.job';
import { CallWebhookJobsJob } from 'src/workspace/workspace-query-runner/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/workspace/workspace-query-runner/jobs/call-webhook.job';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FetchWorkspaceMessagesModule } from 'src/workspace/messaging/services/fetch-workspace-messages.module';
import { EmailJob } from 'src/integrations/email/email.job';
import { EmailModule } from 'src/integrations/email/email.module';
import { emailModuleFactory } from 'src/integrations/email/email.module-factory';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataModule,
    DataSourceModule,
    HttpModule,
    TypeORMModule,
    FetchWorkspaceMessagesModule,
    EmailModule.forRoot({
      useFactory: emailModuleFactory,
      inject: [EnvironmentService],
    }),
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
      provide: EmailJob.name,
      useClass: EmailJob,
    },
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
