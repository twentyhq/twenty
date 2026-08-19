import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { InboundEmailS3ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/providers/inbound-email-s3-client.provider';
import { InboundEmailParserService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-parser.service';
import { InboundEmailStorageService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-storage.service';
import { InboundEmailMessageSourceResolverService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/inbound-email-message-source-resolver.service';
import { SesS3InboundEmailMessageSourceService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/sources/ses-s3-inbound-email-message-source.service';

@Module({
  imports: [
    TwentyConfigModule,
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([MessageChannelEntity, ConnectedAccountEntity]),
  ],
  providers: [
    InboundEmailS3ClientProvider,
    InboundEmailStorageService,
    InboundEmailParserService,
    SesS3InboundEmailMessageSourceService,
    InboundEmailMessageSourceResolverService,
  ],
  exports: [
    InboundEmailS3ClientProvider,
    InboundEmailStorageService,
    InboundEmailParserService,
    SesS3InboundEmailMessageSourceService,
    InboundEmailMessageSourceResolverService,
  ],
})
export class MessagingInboundEmailDriverModule {}
