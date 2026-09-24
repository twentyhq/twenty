import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { computeEmailCreditsUsedMicro } from 'src/modules/emailing/utils/compute-email-credits-used-micro.util';

type EmailUsageScope = {
  workspaceId: string;
  spenders: UsageSpenders;
};

@Injectable()
export class EmailBillingService {
  constructor(
    private readonly usageRecorderService: UsageRecorderService,
    private readonly billingUsageService: BillingUsageService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
  ) {}

  async validateEmailSendOrThrow({
    workspaceId,
    spenders,
  }: EmailUsageScope): Promise<void> {
    await this.billingUsageService.assertUsageAllowed({
      workspaceId,
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      spenders,
    });
  }

  // A caller that already knows how many it is about to send names the count,
  // so a batch straddling the limit is refused whole instead of being admitted
  // on the one email still left and charged for all of them afterwards.
  async findEmailSendRefusal({
    workspaceId,
    spenders,
    emailCount,
  }: EmailUsageScope & { emailCount?: number }): Promise<UsageRefusal | null> {
    return this.billingUsageService.findUsageRefusal({
      workspaceId,
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      spenders,
      cost: isDefined(emailCount)
        ? {
            quantity: emailCount,
            creditsUsedMicro: computeEmailCreditsUsedMicro(emailCount),
          }
        : undefined,
    });
  }

  async billSentEmails({
    workspaceId,
    sentEmailCount,
    spenders,
  }: EmailUsageScope & { sentEmailCount: number }): Promise<void> {
    if (sentEmailCount <= 0) {
      return;
    }

    const creditsUsedMicro = computeEmailCreditsUsedMicro(sentEmailCount);

    await this.usageLimitQuotaService.consumeQuota({
      workspaceId,
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      spenders,
      cost: { creditsUsedMicro, quantity: sentEmailCount },
    });

    await this.usageRecorderService.record(workspaceId, [
      {
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        creditsUsedMicro,
        quantity: sentEmailCount,
        unit: UsageUnit.INVOCATION,
        spenders,
      },
    ]);
  }
}
