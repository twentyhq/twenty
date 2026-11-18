import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileEmailAttachmentModule } from 'src/engine/core-modules/file/file-email-attachment/file-email-attachment.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { FilesFieldModule } from 'src/engine/core-modules/file/files-field/files-field.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { ApplicationMessageChannelsResolver } from 'src/engine/metadata-modules/message-channel/resolvers/application-message-channels.resolver';
import { ApplicationMessageFoldersResolver } from 'src/engine/metadata-modules/message-channel/resolvers/application-message-folders.resolver';
import { ApplicationMessageIngestionResolver } from 'src/engine/metadata-modules/message-channel/resolvers/application-message-ingestion.resolver';
import { ApplicationMessageReadResolver } from 'src/engine/metadata-modules/message-channel/resolvers/application-message-read.resolver';
import { ApplicationMessageSendResolver } from 'src/engine/metadata-modules/message-channel/resolvers/application-message-send.resolver';
import { MessageChannelResolver } from 'src/engine/metadata-modules/message-channel/resolvers/message-channel.resolver';
import { ApplicationMessageChannelsService } from 'src/engine/metadata-modules/message-channel/services/application-message-channels.service';
import { ApplicationMessageFoldersService } from 'src/engine/metadata-modules/message-channel/services/application-message-folders.service';
import { ApplicationMessageIngestionService } from 'src/engine/metadata-modules/message-channel/services/application-message-ingestion.service';
import { ApplicationMessageReadStateService } from 'src/engine/metadata-modules/message-channel/services/application-message-read-state.service';
import { ApplicationMessageReadService } from 'src/engine/metadata-modules/message-channel/services/application-message-read.service';
import { ApplicationMessageSendAttachmentsService } from 'src/engine/metadata-modules/message-channel/services/application-message-send-attachments.service';
import { ApplicationMessageSendService } from 'src/engine/metadata-modules/message-channel/services/application-message-send.service';
import { ApplicationThreadLatestMessagesService } from 'src/engine/metadata-modules/message-channel/services/application-thread-latest-messages.service';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MessagingProviderModule } from 'src/engine/metadata-modules/messaging-provider/messaging-provider.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { MatchParticipantModule } from 'src/modules/match-participant/match-participant.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    FeatureFlagModule,
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      MessageFolderEntity,
      ConnectedAccountEntity,
      FileEntity,
    ]),
    CacheLockModule,
    PermissionsModule,
    ConnectedAccountMetadataModule,
    MessagingImportManagerModule,
    MessagingCommonModule,
    MatchParticipantModule,
    EmailingDomainModule,
    WorkspaceCacheModule,
    MessagingProviderModule,
    FileUrlModule,
    FilesFieldModule,
    FileEmailAttachmentModule,
  ],
  providers: [
    MessageChannelMetadataService,
    MessageChannelResolver,
    ApplicationMessageChannelsService,
    ApplicationMessageChannelsResolver,
    ApplicationMessageFoldersService,
    ApplicationMessageFoldersResolver,
    ApplicationMessageIngestionService,
    ApplicationMessageIngestionResolver,
    ApplicationMessageReadStateService,
    ApplicationMessageReadService,
    ApplicationMessageReadResolver,
    ApplicationMessageSendService,
    ApplicationMessageSendAttachmentsService,
    ApplicationThreadLatestMessagesService,
    ApplicationMessageSendResolver,
    provideWorkspaceScopedRepository(MessageFolderEntity),
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [MessageChannelMetadataService],
})
export class MessageChannelMetadataModule {}
