import { Injectable } from '@nestjs/common';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { EMAIL_MARGIN_MULTIPLIER } from 'src/modules/emailing/constants/email-margin-multiplier';
import { SES_EMAIL_COST_PER_THOUSAND_DOLLARS } from 'src/modules/emailing/constants/ses-email-cost-per-thousand-dollars';

@Injectable()
export class EmailBillingService {
  constructor(
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly billingService: BillingService,
    private readonly billingUsageService: BillingUsageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async hasEmailCredits(workspaceId: string): Promise<boolean> {
    return this.billingUsageService.hasAvailableCredits(workspaceId);
  }

  async validateEmailCreditsOrThrow(workspaceId: string): Promise<void> {
    await this.billingUsageService.hasAvailableCreditsOrThrow(workspaceId);
  }

  async billSentEmails({
    workspaceId,
    sentEmailCount,
    userWorkspaceId,
  }: {
    workspaceId: string;
    sentEmailCount: number;
    userWorkspaceId?: string | null;
  }): Promise<void> {
    if (sentEmailCount <= 0) {
      return;
    }

    const providerCostInDollars =
      (sentEmailCount / 1000) * SES_EMAIL_COST_PER_THOUSAND_DOLLARS;
    const chargedInDollars = providerCostInDollars * EMAIL_MARGIN_MULTIPLIER;
    const creditsUsedMicro = Math.round(
      convertDollarsToBillingCredits(chargedInDollars),
    );

    let periodStart: Date | undefined;

    if (this.billingService.isBillingEnabled()) {
      const { currentBillingSubscription } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'currentBillingSubscription',
        ]);

      if (currentBillingSubscription !== NO_BILLING_SUBSCRIPTION) {
        periodStart = currentBillingSubscription.currentPeriodStart;

        await this.billingUsageService.decrementAvailableCreditsInCache({
          workspaceId,
          usedCredits: creditsUsedMicro,
        });
      }
    }

    this.workspaceEventEmitter.emitCustomBatchEvent<UsageEvent>(
      USAGE_RECORDED,
      [
        {
          resourceType: UsageResourceType.EMAIL,
          operationType: UsageOperationType.EMAIL_SEND,
          creditsUsedMicro,
          quantity: sentEmailCount,
          unit: UsageUnit.INVOCATION,
          userWorkspaceId: userWorkspaceId || null,
          periodStart,
        },
      ],
      workspaceId,
    );
  }
}
