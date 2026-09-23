import { Injectable } from '@nestjs/common';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';
import { type EmailCreditContext } from 'src/modules/emailing/types/email-credit-context.type';
import { EMAIL_PRICE_PER_THOUSAND_DOLLARS } from 'src/modules/emailing/constants/email-price-per-thousand-dollars';

@Injectable()
export class EmailBillingService {
  constructor(
    private readonly usageRecorderService: UsageRecorderService,
    private readonly billingUsageService: BillingUsageService,
  ) {}

  async validateEmailCreditsOrThrow(workspaceId: string): Promise<void> {
    await this.billingUsageService.assertUsageAllowed({
      workspaceId,
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      spenders: {},
    });
  }

  async getEmailCreditContext(
    workspaceId: string,
  ): Promise<EmailCreditContext> {
    const { hasAvailableCredits } =
      await this.billingUsageService.getCreditAvailability(workspaceId);

    return { hasCredits: hasAvailableCredits };
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

    const chargedInDollars =
      (sentEmailCount / 1000) * EMAIL_PRICE_PER_THOUSAND_DOLLARS;
    const creditsUsedMicro = convertDollarsToCreditsMicro(chargedInDollars);

    await this.billingUsageService.consumeUsageQuota({
      workspaceId,
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      spenders: { userWorkspaceId },
      cost: { creditsUsedMicro, quantity: sentEmailCount },
    });

    await this.usageRecorderService.record(workspaceId, [
      {
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        creditsUsedMicro,
        quantity: sentEmailCount,
        unit: UsageUnit.INVOCATION,
        spenders: { userWorkspaceId },
      },
    ]);
  }
}
