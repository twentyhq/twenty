import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileRemoteContentModule } from 'src/engine/core-modules/file/file-remote-content/file-remote-content.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { MessagingGmailDriverModule } from 'src/modules/messaging/message-import-manager/drivers/gmail/messaging-gmail-driver.module';
import { MessagingIMAPDriverModule } from 'src/modules/messaging/message-import-manager/drivers/imap/messaging-imap-driver.module';
import { MessagingMicrosoftDriverModule } from 'src/modules/messaging/message-import-manager/drivers/microsoft/messaging-microsoft-driver.module';
import { MessagingRemoteAttachmentService } from 'src/modules/messaging/message-import-manager/services/messaging-remote-attachment.service';

@Module({
  imports: [
    FileRemoteContentModule,
    ThrottlerModule,
    MessagingGmailDriverModule,
    MessagingMicrosoftDriverModule,
    MessagingIMAPDriverModule,
    TypeOrmModule.forFeature([MessageChannelEntity]),
  ],
  providers: [
    MessagingRemoteAttachmentService,
    provideWorkspaceScopedRepository(MessageChannelEntity),
  ],
})
export class MessagingRemoteAttachmentModule {}
