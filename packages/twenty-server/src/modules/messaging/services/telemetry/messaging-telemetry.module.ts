import { Module } from '@nestjs/common';

import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { MessagingTelemetryService } from 'src/modules/messaging/services/telemetry/messaging-telemetry.service';

@Module({
  imports: [AnalyticsModule],
  providers: [MessagingTelemetryService],
  exports: [MessagingTelemetryService],
})
export class MessagingTelemetryModule {}
