import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { AutoCompaniesAndContactsCreationModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/auto-companies-and-contacts-creation.module';
import { GoogleAPIRefreshAccessTokenModule } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.module';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { BlocklistItemDeleteMessagesJob } from 'src/modules/messaging/jobs/blocklist-item-delete-messages.job';
import { BlocklistReimportMessagesJob } from 'src/modules/messaging/jobs/blocklist-reimport-messages.job';
import { DeleteConnectedAccountAssociatedMessagingDataJob } from 'src/modules/messaging/jobs/delete-connected-account-associated-messaging-data.job';
import { GmailFullSyncJob } from 'src/modules/messaging/jobs/gmail-full-sync.job';
import { GmailPartialSyncJob } from 'src/modules/messaging/jobs/gmail-partial-sync.job';
import { MessagingCreateCompanyAndContactAfterSyncJob } from 'src/modules/messaging/jobs/messaging-create-company-and-contact-after-sync.job';
import { GmailFullSyncModule } from 'src/modules/messaging/services/gmail-full-sync/gmail-full-sync.module';
import { GmailPartialSyncModule } from 'src/modules/messaging/services/gmail-partial-sync/gmail-partial-sync.module';
import { ThreadCleanerModule } from 'src/modules/messaging/services/thread-cleaner/thread-cleaner.module';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-participant.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
      MessageChannelWorkspaceEntity,
      MessageParticipantWorkspaceEntity,
      MessageChannelMessageAssociationWorkspaceEntity,
      BlocklistWorkspaceEntity,
    ]),
    GmailFullSyncModule,
    GmailPartialSyncModule,
    ThreadCleanerModule,
    GoogleAPIRefreshAccessTokenModule,
    AutoCompaniesAndContactsCreationModule,
  ],
  providers: [
    {
      provide: BlocklistReimportMessagesJob.name,
      useClass: BlocklistReimportMessagesJob,
    },
    {
      provide: BlocklistItemDeleteMessagesJob.name,
      useClass: BlocklistItemDeleteMessagesJob,
    },
    {
      provide: GmailFullSyncJob.name,
      useClass: GmailFullSyncJob,
    },
    {
      provide: GmailPartialSyncJob.name,
      useClass: GmailPartialSyncJob,
    },
    {
      provide: DeleteConnectedAccountAssociatedMessagingDataJob.name,
      useClass: DeleteConnectedAccountAssociatedMessagingDataJob,
    },
    {
      provide: MessagingCreateCompanyAndContactAfterSyncJob.name,
      useClass: MessagingCreateCompanyAndContactAfterSyncJob,
    },
  ],
})
export class MessagingJobModule {}
