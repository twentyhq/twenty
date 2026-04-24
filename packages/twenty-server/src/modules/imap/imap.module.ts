import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImapService } from './services/imap.service';
import { ImapSyncService } from './services/imap-sync.service';
import { ImapAuthService } from './services/imap-auth.service';
import { ImapClientService } from './services/imap-client.service';

import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/common/standard-objects/message-channel.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/common/standard-objects/message.object-metadata';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConnectedAccountObjectMetadata,
      MessageChannelObjectMetadata,
      MessageObjectMetadata,
    ]),
  ],
  providers: [
    ImapService,
    ImapSyncService,
    ImapAuthService,
    ImapClientService,
  ],
  exports: [ImapService, ImapSyncService],
})
export class ImapModule {}
