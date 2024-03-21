import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { FetchMessagesByBatchesModule } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.module';
import { GmailFetchMessageContentFromCacheService } from 'src/modules/messaging/services/gmail-fetch-message-content-from-cache/gmail-fetch-message-content-from-cache.service';
import { MessageModule } from 'src/modules/messaging/services/message/message.module';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';

@Module({
  imports: [
    FetchMessagesByBatchesModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      MessageChannelObjectMetadata,
    ]),
    MessageModule,
  ],
  providers: [GmailFetchMessageContentFromCacheService],
  exports: [GmailFetchMessageContentFromCacheService],
})
export class GmailFetchMessageContentFromCacheModule {}
