import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { MessageSuppressionEntity } from 'src/engine/core-modules/emailing-domain/message-suppression.entity';
import { UnsubscribeTopicEntity } from 'src/engine/core-modules/emailing-domain/unsubscribe-topic.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageChannelMetadataModule } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { UnsubscribeController } from 'src/modules/emailing/controllers/unsubscribe.controller';
import { EmailingSendResolver } from 'src/modules/emailing/resolvers/emailing-send.resolver';
import { UnsubscribeTopicResolver } from 'src/modules/emailing/resolvers/unsubscribe-topic.resolver';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { UnsubscribeTopicService } from 'src/modules/emailing/services/unsubscribe-topic.service';

@Module({
  imports: [
    EmailingDomainModule,
    MessageChannelMetadataModule,
    FeatureFlagModule,
    PermissionsModule,
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      EmailingDomainEntity,
      MessageSuppressionEntity,
      UnsubscribeTopicEntity,
    ]),
  ],
  controllers: [UnsubscribeController],
  providers: [
    MessageCampaignService,
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
    MessageSuppressionService,
    UnsubscribeTopicService,
  ],
})
export class EmailingModule {}
