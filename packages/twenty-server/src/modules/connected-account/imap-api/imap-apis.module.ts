import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { CalendarChannelDataAccessModule } from 'src/engine/metadata-modules/calendar-channel/data-access/calendar-channel-data-access.module';
import { ConnectedAccountDataAccessModule } from 'src/engine/metadata-modules/connected-account/data-access/connected-account-data-access.module';
import { MessageChannelDataAccessModule } from 'src/engine/metadata-modules/message-channel/data-access/message-channel-data-access.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { ImapSmtpCalDavAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity]),
    MessageQueueModule,
    WorkspaceEventEmitterModule,
    TwentyConfigModule,
    TwentyORMModule,
    FeatureFlagModule,
    AuthModule,
    CalendarChannelDataAccessModule,
    ConnectedAccountDataAccessModule,
    MessageChannelDataAccessModule,
  ],
  providers: [ImapSmtpCalDavAPIService],
  exports: [ImapSmtpCalDavAPIService],
})
export class IMAPAPIsModule {}
