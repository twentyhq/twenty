import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { OnboardingEmailDigestService } from 'src/modules/onboarding-email-digest/services/onboarding-email-digest.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectedAccountEntity, MessageChannelEntity]),
  ],
  providers: [OnboardingEmailDigestService],
  exports: [OnboardingEmailDigestService],
})
export class OnboardingEmailDigestModule {}
