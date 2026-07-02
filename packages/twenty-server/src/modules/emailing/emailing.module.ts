import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { MessageSuppressionEntity } from 'src/engine/core-modules/emailing-domain/message-suppression.entity';
import { UnsubscribeTopicEntity } from 'src/engine/core-modules/emailing-domain/unsubscribe-topic.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageChannelMetadataModule } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { UnsubscribeController } from 'src/modules/emailing/controllers/unsubscribe.controller';
import { EmailingSendResolver } from 'src/modules/emailing/resolvers/emailing-send.resolver';
import { UnsubscribeTopicResolver } from 'src/modules/emailing/resolvers/unsubscribe-topic.resolver';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { UnsubscribeTopicService } from 'src/modules/emailing/services/unsubscribe-topic.service';

@Module({
  imports: [
    EmailingDomainModule,
    MessageChannelMetadataModule,
    FeatureFlagModule,
    PermissionsModule,
    UserRoleModule,
    BillingModule,
    WorkspaceEventEmitterModule,
    WorkspaceCacheModule,
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      EmailingDomainEntity,
      MessageSuppressionEntity,
      UnsubscribeTopicEntity,
    ]),
  ],
  controllers: [UnsubscribeController],
  providers: [
    EmailBillingService,
    MessageCampaignService,
    MessageCampaignStatisticsService,
    MessageSuppressionService,
    UnsubscribeTopicService,
    EmailingDomainSenderService,
    EmailingSendResolver,
    UnsubscribeTopicResolver,
    provideWorkspaceScopedRepository(EmailingDomainEntity),
    provideWorkspaceScopedRepository(MessageSuppressionEntity),
    provideWorkspaceScopedRepository(UnsubscribeTopicEntity),
  ],
  exports: [
    EmailingDomainSenderService,
    MessageCampaignService,
    MessageCampaignStatisticsService,
    MessageSuppressionService,
    UnsubscribeTopicService,
  ],
})
export class EmailingModule {}
