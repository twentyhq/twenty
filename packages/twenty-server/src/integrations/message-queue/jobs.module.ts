import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GmailFullSyncJob } from 'src/workspace/messaging/jobs/gmail-full-sync.job';
import { CallWebhookJobsJob } from 'src/workspace/workspace-query-runner/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/workspace/workspace-query-runner/jobs/call-webhook.job';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { CleanInactiveWorkspaceJob } from 'src/workspace/workspace-cleaner/crons/clean-inactive-workspace.job';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { MessagingModule } from 'src/workspace/messaging/messaging.module';
import { GmailPartialSyncJob } from 'src/workspace/messaging/jobs/gmail-partial-sync.job';
import { EmailSenderJob } from 'src/integrations/email/email-sender.job';
import { UserModule } from 'src/core/user/user.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { FetchAllWorkspacesMessagesJob } from 'src/workspace/messaging/commands/crons/fetch-all-workspaces-messages.job';
import { ConnectedAccountModule } from 'src/workspace/messaging/repositories/connected-account/connected-account.module';
import { MatchMessageParticipantJob } from 'src/workspace/messaging/jobs/match-message-participant.job';
import { CreateCompaniesAndContactsAfterSyncJob } from 'src/workspace/messaging/jobs/create-companies-and-contacts-after-sync.job';
import { CreateCompaniesAndContactsModule } from 'src/workspace/messaging/services/create-companies-and-contacts/create-companies-and-contacts.module';
import { MessageChannelModule } from 'src/workspace/messaging/repositories/message-channel/message-channel.module';
import { MessageParticipantModule } from 'src/workspace/messaging/repositories/message-participant/message-participant.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataModule,
    DataSourceModule,
    HttpModule,
    TypeORMModule,
    MessagingModule,
    UserModule,
    EnvironmentModule,
    TypeORMModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    ConnectedAccountModule,
    MessageParticipantModule,
    CreateCompaniesAndContactsModule,
    MessageChannelModule,
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
      provide: CleanInactiveWorkspaceJob.name,
      useClass: CleanInactiveWorkspaceJob,
    },
    { provide: EmailSenderJob.name, useClass: EmailSenderJob },
    {
      provide: FetchAllWorkspacesMessagesJob.name,
      useClass: FetchAllWorkspacesMessagesJob,
    },
    {
      provide: MatchMessageParticipantJob.name,
      useClass: MatchMessageParticipantJob,
    },
    {
      provide: CreateCompaniesAndContactsAfterSyncJob.name,
      useClass: CreateCompaniesAndContactsAfterSyncJob,
    },
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
