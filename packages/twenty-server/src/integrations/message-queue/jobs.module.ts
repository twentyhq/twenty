import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GmailFullSyncJob } from 'src/business/modules/message/jobs/gmail-full-sync.job';
import { CallWebhookJobsJob } from 'src/engine/graphql/workspace-query-runner/jobs/call-webhook-jobs.job';
import { CallWebhookJob } from 'src/engine/graphql/workspace-query-runner/jobs/call-webhook.job';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ObjectMetadataModule } from 'src/engine-metadata/object-metadata/object-metadata.module';
import { DataSourceModule } from 'src/engine-metadata/data-source/data-source.module';
import { CleanInactiveWorkspaceJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-inactive-workspace.job';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { MessagingModule } from 'src/business/modules/message/messaging.module';
import { GmailPartialSyncJob } from 'src/business/modules/message/jobs/gmail-partial-sync.job';
import { EmailSenderJob } from 'src/integrations/email/email-sender.job';
import { UserModule } from 'src/engine/modules/user/user.module';
import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { FetchAllWorkspacesMessagesJob } from 'src/business/modules/message/commands/crons/fetch-all-workspaces-messages.job';
import { ConnectedAccountModule } from 'src/business/modules/calendar-and-messaging/repositories/connected-account/connected-account.module';
import { MatchMessageParticipantJob } from 'src/business/modules/message/jobs/match-message-participant.job';
import { CreateCompaniesAndContactsAfterSyncJob } from 'src/business/modules/message/jobs/create-companies-and-contacts-after-sync.job';
import { CreateCompaniesAndContactsModule } from 'src/engine-workspace/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.module';
import { MessageChannelModule } from 'src/business/modules/message/repositories/message-channel/message-channel.module';
import { MessageParticipantModule } from 'src/business/modules/message/repositories/message-participant/message-participant.module';
import { DataSeedDemoWorkspaceModule } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace.module';
import { DataSeedDemoWorkspaceJob } from 'src/database/commands/data-seed-demo-workspace/jobs/data-seed-demo-workspace.job';
import { DeleteConnectedAccountAssociatedMessagingDataJob } from 'src/business/modules/message/jobs/delete-connected-account-associated-messaging-data.job';
import { ThreadCleanerModule } from 'src/business/modules/message/services/thread-cleaner/thread-cleaner.module';
import { UpdateSubscriptionJob } from 'src/engine/modules/billing/jobs/update-subscription.job';
import { BillingModule } from 'src/engine/modules/billing/billing.module';
import { UserWorkspaceModule } from 'src/engine/modules/user-workspace/user-workspace.module';
import { StripeModule } from 'src/engine/modules/billing/stripe/stripe.module';
import { Workspace } from 'src/engine/modules/workspace/workspace.entity';
import { FeatureFlagEntity } from 'src/engine/modules/feature-flag/feature-flag.entity';
import { CalendarModule } from 'src/business/modules/calendar/calendar.module';
import { DataSourceEntity } from 'src/engine-metadata/data-source/data-source.entity';
import { GoogleCalendarFullSyncJob } from 'src/business/modules/calendar/jobs/google-calendar-full-sync.job';
import { CalendarEventCleanerModule } from 'src/business/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.module';
import { RecordPositionBackfillJob } from 'src/engine/graphql/workspace-query-runner/jobs/record-position-backfill.job';
import { RecordPositionBackfillModule } from 'src/engine/graphql/workspace-query-runner/services/record-position-backfill-module';
import { DeleteConnectedAccountAssociatedCalendarDataJob } from 'src/business/modules/message/jobs/delete-connected-account-associated-calendar-data.job';

@Module({
  imports: [
    BillingModule,
    DataSourceModule,
    ConnectedAccountModule,
    CreateCompaniesAndContactsModule,
    DataSeedDemoWorkspaceModule,
    EnvironmentModule,
    HttpModule,
    MessagingModule,
    MessageParticipantModule,
    MessageChannelModule,
    CalendarModule,
    ObjectMetadataModule,
    StripeModule,
    ThreadCleanerModule,
    CalendarEventCleanerModule,
    TypeORMModule,
    TypeOrmModule.forFeature([Workspace, FeatureFlagEntity], 'core'),
    TypeOrmModule.forFeature([DataSourceEntity], 'metadata'),
    UserModule,
    UserWorkspaceModule,
    WorkspaceDataSourceModule,
    RecordPositionBackfillModule,
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
      provide: GoogleCalendarFullSyncJob.name,
      useClass: GoogleCalendarFullSyncJob,
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
    {
      provide: DataSeedDemoWorkspaceJob.name,
      useClass: DataSeedDemoWorkspaceJob,
    },
    {
      provide: DeleteConnectedAccountAssociatedMessagingDataJob.name,
      useClass: DeleteConnectedAccountAssociatedMessagingDataJob,
    },
    {
      provide: DeleteConnectedAccountAssociatedCalendarDataJob.name,
      useClass: DeleteConnectedAccountAssociatedCalendarDataJob,
    },
    { provide: UpdateSubscriptionJob.name, useClass: UpdateSubscriptionJob },
    {
      provide: RecordPositionBackfillJob.name,
      useClass: RecordPositionBackfillJob,
    },
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
