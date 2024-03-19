import { Module } from '@nestjs/common';

import { WorkspaceModule } from 'src/engine/modules/workspace/workspace.module';
import { UserModule } from 'src/engine/modules/user/user.module';
import { RefreshTokenModule } from 'src/engine/modules/refresh-token/refresh-token.module';
import { AuthModule } from 'src/engine/modules/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/modules/feature-flag/feature-flag.module';
import { OpenApiModule } from 'src/engine/modules/open-api/open-api.module';
import { TimelineMessagingModule } from 'src/engine/modules/messaging/timeline-messaging.module';
import { BillingModule } from 'src/engine/modules/billing/billing.module';
import { HealthModule } from 'src/engine/modules/health/health.module';
import { TimelineCalendarEventModule } from 'src/engine/modules/calendar/timeline-calendar-event.module';

import { AnalyticsModule } from './analytics/analytics.module';
import { FileModule } from './file/file.module';
import { ClientConfigModule } from './client-config/client-config.module';

@Module({
  imports: [
    HealthModule,
    AnalyticsModule,
    AuthModule,
    BillingModule,
    ClientConfigModule,
    FeatureFlagModule,
    FileModule,
    OpenApiModule,
    RefreshTokenModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
  ],
  exports: [
    AnalyticsModule,
    AuthModule,
    FeatureFlagModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
  ],
})
export class EngineModulesModule {}
