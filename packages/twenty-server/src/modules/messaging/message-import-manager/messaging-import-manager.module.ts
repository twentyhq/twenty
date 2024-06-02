import { Module } from '@nestjs/common';

import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { MessagingTelemetryService } from 'src/modules/messaging/common/services/messaging-telemetry.service';
import { MessagingMessageListFetchJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { MessagingMessagesImportJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-messages-import.job';
import { DeleteConnectedAccountAssociatedMessagingDataJob } from 'src/modules/messaging/message-participants-manager/jobs/messaging-connected-account-deletion-cleanup.job';
import { MessagingCreateCompanyAndContactAfterSyncJob } from 'src/modules/messaging/message-participants-manager/jobs/messaging-create-company-and-contact-after-sync.job';

@Module({
  imports: [AnalyticsModule],
  providers: [
    MessagingTelemetryService,

    {
      provide: MessagingMessageListFetchJob.name,
      useClass: MessagingMessageListFetchJob,
    },
    {
      provide: MessagingMessagesImportJob.name,
      useClass: MessagingMessagesImportJob,
    },
    {
      provide: DeleteConnectedAccountAssociatedMessagingDataJob.name,
      useClass: DeleteConnectedAccountAssociatedMessagingDataJob,
    },
    {
      provide: MessagingCreateCompanyAndContactAfterSyncJob.name,
      useClass: MessagingCreateCompanyAndContactAfterSyncJob,
    },
  ],
  exports: [MessagingTelemetryService],
})
export class MessagingTelemetryModule {}
