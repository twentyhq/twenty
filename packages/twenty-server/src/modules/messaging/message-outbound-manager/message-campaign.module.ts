import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { MessageChannelMetadataModule } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { MessagingCampaignSendRecipientJob } from 'src/modules/messaging/message-outbound-manager/jobs/messaging-campaign-send-recipient.job';
import { MessageCampaignResolver } from 'src/modules/messaging/message-outbound-manager/resolvers/message-campaign.resolver';
import { MessagingCampaignService } from 'src/modules/messaging/message-outbound-manager/services/messaging-campaign.service';

@Module({
  imports: [
    EmailingDomainModule,
    MessageChannelMetadataModule,
    PermissionsModule,
    // MessageQueueModule is @Global; the @InjectMessageQueue decorator works
    // without an explicit import here.
    TypeOrmModule.forFeature([EmailingDomainEntity]),
  ],
  providers: [
    MessageCampaignResolver,
    MessagingCampaignService,
    MessagingCampaignSendRecipientJob,
  ],
})
export class MessageCampaignModule {}
