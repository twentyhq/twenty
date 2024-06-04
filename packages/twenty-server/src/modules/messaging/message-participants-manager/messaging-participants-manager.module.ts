import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { AutoCompaniesAndContactsCreationModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/auto-companies-and-contacts-creation.module';
import { MessagingGmailDriverModule } from 'src/modules/messaging/message-import-manager/drivers/gmail/messaging-gmail-driver.module';
import { MessagingCreateCompanyAndContactAfterSyncJob } from 'src/modules/messaging/message-participants-manager/jobs/messaging-create-company-and-contact-after-sync.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    AnalyticsModule,
    MessagingGmailDriverModule,
    AutoCompaniesAndContactsCreationModule,
  ],
  providers: [
    {
      provide: MessagingCreateCompanyAndContactAfterSyncJob.name,
      useClass: MessagingCreateCompanyAndContactAfterSyncJob,
    },
  ],
})
export class MessaginParticipantsManagerModule {}
