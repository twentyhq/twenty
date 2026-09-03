import { Injectable } from '@nestjs/common';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type CurrentBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type EmailCreditContext } from 'src/modules/emailing/types/email-credit-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeEmailCreditsMicro } from 'src/modules/emailing/utils/compute-email-credits-micro.util';

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

  async reserveEmailCredits({
    workspaceId,
    emailCount,
    currentBillingSubscription,
  }: {
    workspaceId: string;
    emailCount: number;
    currentBillingSubscription?: CurrentBillingSubscription;
  }): Promise<boolean> {
    if (emailCount <= 0 || !this.billingService.isBillingEnabled()) {
      return true;
    }

    const remainingCreditsMicro = await this.adjustReservedCredits({
      workspaceId,
      emailCount,
      currentBillingSubscription,
    });

    if (remainingCreditsMicro >= 0) {
      return true;
    }

    await this.releaseEmailCredits({
      workspaceId,
      emailCount,
      currentBillingSubscription,
    });

    return false;
  }

  async releaseEmailCredits({
    workspaceId,
    emailCount,
    currentBillingSubscription,
  }: {
    workspaceId: string;
    emailCount: number;
    currentBillingSubscription?: CurrentBillingSubscription;
  }): Promise<void> {
    if (emailCount <= 0 || !this.billingService.isBillingEnabled()) {
      return;
    }

    await this.adjustReservedCredits({
      workspaceId,
      emailCount: -emailCount,
      currentBillingSubscription,
    });
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
        creditsUsedMicro: computeEmailCreditsMicro(sentEmailCount),
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
      await this.adjustReservedCredits({
        workspaceId,
        emailCount: sentEmailCount,
        currentBillingSubscription,
      });
    }

    await this.recordEmailSendUsage({
      workspaceId,
      sentEmailCount,
      userWorkspaceId,
    });
  }

  private async adjustReservedCredits({
    workspaceId,
    emailCount,
    currentBillingSubscription: providedCurrentBillingSubscription,
  }: {
    workspaceId: string;
    emailCount: number;
    currentBillingSubscription?: CurrentBillingSubscription;
  }): Promise<number> {
    const currentBillingSubscription =
      await this.billingUsageService.resolveCurrentBillingSubscription({
        workspaceId,
        providedCurrentBillingSubscription,
      });

    if (currentBillingSubscription === NO_BILLING_SUBSCRIPTION) {
      return Number.POSITIVE_INFINITY;
    }

    return this.billingUsageService.decrementAvailableCreditsInCache({
      workspaceId,
      usedCredits: computeEmailCreditsMicro(emailCount),
      currentBillingSubscription,
    });
  }
}
