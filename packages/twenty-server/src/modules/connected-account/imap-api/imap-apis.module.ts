import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { ImapSmtpCalDavAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';
import { MessagingFolderSyncManagerModule } from 'src/modules/messaging/message-folder-manager/messaging-folder-sync-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ObjectMetadataEntity,
      CalendarChannelEntity,
      ConnectedAccountEntity,
      MessageChannelEntity,
      UserWorkspaceEntity,
    ]),
    MessageQueueModule,
    WorkspaceEventEmitterModule,
    TwentyConfigModule,
    TwentyORMModule,
    FeatureFlagModule,
    AuthModule,
    MessagingFolderSyncManagerModule,
  ],
  providers: [ImapSmtpCalDavAPIService],
  exports: [ImapSmtpCalDavAPIService],
})
export class IMAPAPIsModule {}
