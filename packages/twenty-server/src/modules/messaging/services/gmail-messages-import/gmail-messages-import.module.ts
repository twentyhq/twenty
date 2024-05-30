import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { FetchMessagesByBatchesModule } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.module';
import { GmailMessagesImportV2Service } from 'src/modules/messaging/services/gmail-messages-import/gmail-messages-import-v2.service';
import { GmailMessagesImportService } from 'src/modules/messaging/services/gmail-messages-import/gmail-messages-import.service';
import { SaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/services/gmail-messages-import/save-messages-and-enqueue-contact-creation.service';
import { MessageParticipantModule } from 'src/modules/messaging/services/message-participant/message-participant.module';
import { MessageModule } from 'src/modules/messaging/services/message/message.module';
import { SetMessageChannelSyncStatusModule } from 'src/modules/messaging/services/set-message-channel-sync-status/set-message-channel-sync-status.module';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';

@Module({
  imports: [
    FetchMessagesByBatchesModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
      MessageChannelWorkspaceEntity,
    ]),
    MessageModule,
    WorkspaceDataSourceModule,
    MessageModule,
    MessageParticipantModule,
    SetMessageChannelSyncStatusModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
  ],
  providers: [
    GmailMessagesImportService,
    GmailMessagesImportV2Service,
    SaveMessagesAndEnqueueContactCreationService,
  ],
  exports: [GmailMessagesImportService, GmailMessagesImportV2Service],
})
export class GmailMessagesImportModule {}
