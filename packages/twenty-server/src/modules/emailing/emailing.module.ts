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
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { UnsubscribeController } from 'src/modules/emailing/controllers/unsubscribe.controller';
import { EmailingSendResolver } from 'src/modules/emailing/resolvers/emailing-send.resolver';
import { MessageSuppressionResolver } from 'src/modules/emailing/resolvers/message-suppression.resolver';
import { UnsubscribeTopicResolver } from 'src/modules/emailing/resolvers/unsubscribe-topic.resolver';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignDraftService } from 'src/modules/emailing/services/message-campaign-draft.service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { UnsubscribeTopicService } from 'src/modules/emailing/services/unsubscribe-topic.service';
import { SaveCampaignTool } from 'src/modules/emailing/tools/save-campaign-tool';

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
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      EmailingDomainEntity,
      MessageSuppressionEntity,
      UnsubscribeTopicEntity,
    ]),
  ],
  controllers: [UnsubscribeController],
  providers: [
    CampaignVariableService,
    EmailBillingService,
    MessageCampaignService,
    MessageCampaignDraftService,
    MessageCampaignStatisticsService,
    MessageSuppressionService,
    UnsubscribeTopicService,
    EmailingDomainSenderService,
    SaveCampaignTool,
    EmailingSendResolver,
    MessageSuppressionResolver,
    UnsubscribeTopicResolver,
    provideWorkspaceScopedRepository(EmailingDomainEntity),
    provideWorkspaceScopedRepository(MessageSuppressionEntity),
    provideWorkspaceScopedRepository(UnsubscribeTopicEntity),
  ],
  exports: [
    EmailingDomainSenderService,
    MessageCampaignService,
    MessageCampaignDraftService,
    MessageCampaignStatisticsService,
    MessageSuppressionService,
    UnsubscribeTopicService,
    SaveCampaignTool,
  ],
})
export class EmailingModule {}
