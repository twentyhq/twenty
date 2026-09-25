import { Injectable } from '@nestjs/common';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { buildEmailQuotaCost } from 'src/modules/emailing/utils/build-email-quota-cost.util';
import { computeEmailCreditsUsedMicro } from 'src/modules/emailing/utils/compute-email-credits-used-micro.util';

type EmailUsageScope = {
  workspaceId: string;
  spenders: UsageSpenders;
};

type EmailSendScope = EmailUsageScope & { emailCount?: number };

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
    emailCount,
  }: EmailSendScope): Promise<void> {
    await this.billingUsageService.assertUsageAllowed({
      workspaceId,
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      spenders,
      cost: buildEmailQuotaCost(emailCount),
    });
  }

  async findEmailSendRefusal({
    workspaceId,
    spenders,
    emailCount,
  }: EmailSendScope): Promise<UsageRefusal | null> {
    return this.billingUsageService.findUsageRefusal({
      workspaceId,
      resourceType: UsageResourceType.EMAIL,
      operationType: UsageOperationType.EMAIL_SEND,
      spenders,
      cost: buildEmailQuotaCost(emailCount),
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
