import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-channel/interceptors/message-channel-graphql-api-exception.interceptor';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { ApplicationMessageChannelsResolver } from 'src/engine/metadata-modules/message-channel/resolvers/application-message-channels.resolver';
import { ApplicationMessageIngestionResolver } from 'src/engine/metadata-modules/message-channel/resolvers/application-message-ingestion.resolver';
import { MessageChannelResolver } from 'src/engine/metadata-modules/message-channel/resolvers/message-channel.resolver';
import { ApplicationMessageChannelsService } from 'src/engine/metadata-modules/message-channel/services/application-message-channels.service';
import { ApplicationMessageIngestionService } from 'src/engine/metadata-modules/message-channel/services/application-message-ingestion.service';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      MessageFolderEntity,
      ConnectedAccountEntity,
    ]),
    CacheLockModule,
    PermissionsModule,
    ConnectedAccountMetadataModule,
    MessagingImportManagerModule,
    EmailingDomainModule,
    WorkspaceEventEmitterModule,
  ],
  providers: [
    MessageChannelMetadataService,
    MessageChannelResolver,
    ApplicationMessageChannelsService,
    ApplicationMessageChannelsResolver,
    ApplicationMessageIngestionService,
    ApplicationMessageIngestionResolver,
    MessageChannelGraphqlApiExceptionInterceptor,
  ],
  exports: [MessageChannelMetadataService],
})
export class MessageChannelMetadataModule {}
