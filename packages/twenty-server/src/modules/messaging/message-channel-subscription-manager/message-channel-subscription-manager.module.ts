import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { MessageChannelSubscriptionRenewalCronJob } from 'src/modules/messaging/message-channel-subscription-manager/crons/message-channel-subscription-renewal.cron.job';
import { GmailPubSubSubscriberService } from 'src/modules/messaging/message-channel-subscription-manager/drivers/gmail/gmail-pubsub-subscriber.service';
import { GmailSubscriptionDriverService } from 'src/modules/messaging/message-channel-subscription-manager/drivers/gmail/gmail-subscription-driver.service';
import { MessageChannelSubscriptionCleanupJob } from 'src/modules/messaging/message-channel-subscription-manager/jobs/message-channel-subscription-cleanup.job';
import { MessageChannelSubscriptionRenewalJob } from 'src/modules/messaging/message-channel-subscription-manager/jobs/message-channel-subscription-renewal.job';
import { MessageChannelSubscriptionSetupJob } from 'src/modules/messaging/message-channel-subscription-manager/jobs/message-channel-subscription-setup.job';
import { MessageChannelSubscriptionHealthService } from 'src/modules/messaging/message-channel-subscription-manager/services/message-channel-subscription-health.service';
import { MessageChannelSubscriptionMappingService } from 'src/modules/messaging/message-channel-subscription-manager/services/message-channel-subscription-mapping.service';
import { MessageChannelSubscriptionService } from 'src/modules/messaging/message-channel-subscription-manager/services/message-channel-subscription.service';

@Module({
  imports: [
    TwentyConfigModule,
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
    OAuth2ClientManagerModule,
    MessagingCommonModule,
  ],
  providers: [
    MessageChannelSubscriptionService,
    MessageChannelSubscriptionMappingService,
    MessageChannelSubscriptionHealthService,
    GmailSubscriptionDriverService,
    GmailPubSubSubscriberService,
    MessageChannelSubscriptionSetupJob,
    MessageChannelSubscriptionCleanupJob,
    MessageChannelSubscriptionRenewalJob,
    MessageChannelSubscriptionRenewalCronJob,
  ],
  exports: [
    MessageChannelSubscriptionService,
    MessageChannelSubscriptionMappingService,
    MessageChannelSubscriptionHealthService,
    GmailSubscriptionDriverService,
  ],
})
export class MessageChannelSubscriptionManagerModule {}
