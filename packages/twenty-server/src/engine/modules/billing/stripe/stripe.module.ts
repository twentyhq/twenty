import { Module } from '@nestjs/common';

import { StripeService } from 'src/engine/modules/billing/stripe/stripe.service';

@Module({
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
