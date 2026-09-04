import { Injectable } from '@nestjs/common';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type CurrentBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { EMAIL_MARGIN_MULTIPLIER } from 'src/modules/emailing/constants/email-margin-multiplier';
import { SES_EMAIL_COST_PER_THOUSAND_DOLLARS } from 'src/modules/emailing/constants/ses-email-cost-per-thousand-dollars';
import { type EmailCreditContext } from 'src/modules/emailing/types/email-credit-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class EmailBillingService {
  constructor(
    private readonly usageRecorderService: UsageRecorderService,
    private readonly billingService: BillingService,
    private readonly billingUsageService: BillingUsageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async validateEmailCreditsOrThrow(workspaceId: string): Promise<void> {
    await this.billingUsageService.hasAvailableCreditsOrThrow(workspaceId);
  }

  async resolveEmailCreditContext(
    workspaceId: string,
  ): Promise<EmailCreditContext> {
    if (!this.billingService.isBillingEnabled()) {
      return {
        hasCredits: true,
        currentBillingSubscription: NO_BILLING_SUBSCRIPTION,
      };
    }

    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    const { hasAvailableCredits } =
      await this.billingUsageService.getCreditAvailability({
        workspaceId,
        currentBillingSubscription,
      });

    return { hasCredits: hasAvailableCredits, currentBillingSubscription };
  }

  async recordEmailSendUsage({
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

    await this.usageRecorderService.record(workspaceId, [
      {
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        creditsUsedMicro: this.computeCreditsForEmails(sentEmailCount),
        quantity: sentEmailCount,
        unit: UsageUnit.INVOCATION,
        spenders: { userWorkspaceId },
      },
    ]);
  }

  async billSentEmails({
    workspaceId,
    sentEmailCount,
    userWorkspaceId,
    currentBillingSubscription,
  }: {
    workspaceId: string;
    sentEmailCount: number;
    userWorkspaceId?: string | null;
    currentBillingSubscription?: CurrentBillingSubscription;
  }): Promise<void> {
    if (sentEmailCount <= 0) {
      return;
    }

    if (this.billingService.isBillingEnabled()) {
      const resolvedBillingSubscription =
        await this.billingUsageService.resolveCurrentBillingSubscription({
          workspaceId,
          providedCurrentBillingSubscription: currentBillingSubscription,
        });

      if (resolvedBillingSubscription !== NO_BILLING_SUBSCRIPTION) {
        await this.billingUsageService.decrementAvailableCreditsInCache({
          workspaceId,
          usedCredits: this.computeCreditsForEmails(sentEmailCount),
          currentBillingSubscription: resolvedBillingSubscription,
        });
      }
    }

    await this.recordEmailSendUsage({
      workspaceId,
      sentEmailCount,
      userWorkspaceId,
    });
  }

  private computeCreditsForEmails(emailCount: number): number {
    const providerCostInDollars =
      (emailCount / 1000) * SES_EMAIL_COST_PER_THOUSAND_DOLLARS;

    return Math.round(
      convertDollarsToBillingCredits(
        providerCostInDollars * EMAIL_MARGIN_MULTIPLIER,
      ),
    );
  }
}
