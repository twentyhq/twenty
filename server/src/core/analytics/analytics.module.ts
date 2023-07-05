import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsResolver } from './analytics.resolver';

@Module({
  providers: [AnalyticsResolver, AnalyticsService],
})
export class AnalyticsModule {}
