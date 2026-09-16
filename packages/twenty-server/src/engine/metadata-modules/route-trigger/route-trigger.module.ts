import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { RouteTriggerController } from 'src/engine/metadata-modules/route-trigger/route-trigger.controller';

@Module({
  imports: [BillingModule],
  controllers: [RouteTriggerController],
})
export class RouteTriggerModule {}
