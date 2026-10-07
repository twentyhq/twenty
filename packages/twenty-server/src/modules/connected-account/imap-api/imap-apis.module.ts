import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { CalendarCommonModule } from 'src/modules/calendar/common/calendar-common.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { ImapSmtpCalDavApiService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingFolderSyncManagerModule } from 'src/modules/messaging/message-folder-manager/messaging-folder-sync-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalendarChannelEntity,
      ConnectedAccountEntity,
      MessageChannelEntity,
      UserWorkspaceEntity,
    ]),
    AuthModule,
    CalendarCommonModule,
    ConnectedAccountModule,
    ConnectedAccountTokenEncryptionModule,
    MessagingCommonModule,
    MessagingFolderSyncManagerModule,
  ],
  providers: [ImapSmtpCalDavApiService],
  exports: [ImapSmtpCalDavApiService],
})
export class IMAPAPIsModule {}
