import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingController } from 'src/engine/modules/billing/billing.controller';
import { BillingService } from 'src/engine/modules/billing/billing.service';
import { StripeModule } from 'src/engine/modules/billing/stripe/stripe.module';
import { BillingSubscription } from 'src/engine/modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItem } from 'src/engine/modules/billing/entities/billing-subscription-item.entity';
import { Workspace } from 'src/engine/modules/workspace/workspace.entity';
import { BillingResolver } from 'src/engine/modules/billing/billing.resolver';
import { BillingWorkspaceMemberListener } from 'src/engine/modules/billing/listeners/billing-workspace-member.listener';
import { UserWorkspaceModule } from 'src/engine/modules/user-workspace/user-workspace.module';

@Module({
  imports: [
    StripeModule,
    UserWorkspaceModule,
    TypeOrmModule.forFeature(
      [BillingSubscription, BillingSubscriptionItem, Workspace],
      'core',
    ),
  ],
  controllers: [BillingController],
  providers: [BillingService, BillingResolver, BillingWorkspaceMemberListener],
  exports: [BillingService],
})
export class BillingModule {}
