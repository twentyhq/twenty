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
import { WhatsappFormatGroupParticipantsToMessageParticipantsService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-format-group-participants-to-message-participants.service';
import { WhatsappGetAllGroupParticipantsService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-get-all-group-participants.service';
import { WhatsappFindMessageService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-find-message.service';
import { WhatsappResolver } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/resolvers/whatsapp-connection.resolver';
import { WhatsappAccountService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-account.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WhatsappGetAssociatedPhoneNumbersService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-get-associated-phone-numbers.service';
import { IntegrationsEntity } from 'src/engine/metadata-modules/integrations/integrations.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WhatsappRetrieveAppSecretService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-retrieve-app-secret.service';
import { MessageQueueCoreModule } from 'src/engine/core-modules/message-queue/message-queue-core.module';

@Module({
  imports: [
    TwentyConfigModule,
    ObjectMetadataRepositoryModule.forFeature([BlocklistWorkspaceEntity]),
    MessagingCommonModule,
    TypeOrmModule.forFeature([FeatureFlagEntity, IntegrationsEntity]),
    EmailAliasManagerModule,
    FeatureFlagModule,
    WorkspaceDataSourceModule,
    MessageParticipantManagerModule,
    AuthModule,
    PermissionsModule,
    MessageQueueCoreModule,
  ],
  providers: [
    WhatsappConvertMessage,
    WhatsappFindMessageService,
    WhatsappFormatGroupParticipantsToMessageParticipantsService,
    WhatsappGetAllGroupParticipantsService,
    WhatsappUpdatePersonService,
    WhatsappGetAssociatedPhoneNumbersService,
    WhatsappAccountService,
    WhatsappRetrieveAppSecretService,
    WhatsappResolver,
  ],
  // TODO: check if it's correct (probably not but what's missing?)
  // it's kinda working?
  controllers: [WhatsappController],
  exports: [WhatsappResolver],
})
export class MessagingWhatsAppDriverModule {}
