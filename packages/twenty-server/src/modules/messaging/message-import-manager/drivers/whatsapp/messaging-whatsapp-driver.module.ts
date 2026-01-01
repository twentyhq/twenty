import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { EmailAliasManagerModule } from 'src/modules/connected-account/email-alias-manager/email-alias-manager.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MessageParticipantManagerModule } from 'src/modules/messaging/message-participant-manager/message-participant-manager.module';
import { WhatsappController } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/controllers/whatsapp.controller';
import { WhatsappUpdatePersonService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-update-person.service';
import { WhatsappConvertMessage } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-convert-message';
import { WhatsappDownloadMediaService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-download-media.service';
import { WhatsappFormatGroupParticipantsToMessageParticipantsService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-format-group-participants-to-message-participants.service';
import { WhatsappGetAllGroupParticipantsService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-get-all-group-participants.service';

@Module({
  imports: [
    TwentyConfigModule,
    ObjectMetadataRepositoryModule.forFeature([BlocklistWorkspaceEntity]),
    MessagingCommonModule,
    TypeOrmModule.forFeature([FeatureFlagEntity]),
    EmailAliasManagerModule,
    FeatureFlagModule,
    WorkspaceDataSourceModule,
    MessageParticipantManagerModule,
  ],
  providers: [
    WhatsappConvertMessage,
    WhatsappDownloadMediaService,
    WhatsappFormatGroupParticipantsToMessageParticipantsService,
    WhatsappGetAllGroupParticipantsService,
    WhatsappUpdatePersonService,
  ],
  // TODO: check if it's correct (probably not but what's missing?)
  controllers: [WhatsappController],
  exports: [WhatsappController],
})
export class MessagingWhatsAppDriverModule {}
