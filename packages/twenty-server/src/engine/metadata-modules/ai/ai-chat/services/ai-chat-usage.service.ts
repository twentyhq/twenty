import { Injectable } from '@nestjs/common';

import { type AiChatUsageDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-usage.dto';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { findAiChatCreditLimits } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-ai-chat-credit-limits.util';
import { selectAiChatUsage } from 'src/engine/metadata-modules/ai/ai-chat/utils/select-ai-chat-usage.util';

@Injectable()
export class AiChatUsageService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
  ) {}

  async findUsage({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<AiChatUsageDTO | null> {
    const { usageLimits } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimits'],
    );

    const enforcedLimits =
      await this.usageLimitEntitlementService.findEnforceableLimits({
        workspaceId,
        limits: findAiChatCreditLimits({ usageLimits, userWorkspaceId }),
      });

    if (enforcedLimits.length === 0) {
      return this.usageLimitQuotaService.getAllowanceUsage(workspaceId);
    }

    const consumptionById =
      await this.usageLimitQuotaService.readLimitConsumptions({
        workspaceId,
        limits: enforcedLimits,
      });

    return selectAiChatUsage({ limits: enforcedLimits, consumptionById });
  }
}
