import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatMemberCreditsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-member-credits.dto';
import { type AiChatUsageDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-usage.dto';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { buildAiChatMemberCredits } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-ai-chat-member-credits.util';
import { findAiChatCreditLimits } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-ai-chat-credit-limits.util';
import { selectAiChatUsage } from 'src/engine/metadata-modules/ai/ai-chat/utils/select-ai-chat-usage.util';

@Injectable()
export class AiChatUsageService {
  private readonly logger = new Logger(AiChatUsageService.name);

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
    const [usage, memberCredits] = await Promise.all([
      this.findWorkspaceOrLimitUsage({ workspaceId, userWorkspaceId }),
      this.findMemberCredits({ workspaceId, userWorkspaceId }),
    ]);

    return isDefined(usage) ? { ...usage, memberCredits } : null;
  }

  private async findWorkspaceOrLimitUsage({
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
      const allowanceUsage =
        await this.usageLimitQuotaService.getAllowanceUsage(workspaceId);

      return isDefined(allowanceUsage)
        ? { ...allowanceUsage, kind: 'allowance' }
        : null;
    }

    const consumptionById =
      await this.usageLimitQuotaService.readLimitConsumptions({
        workspaceId,
        limits: enforcedLimits,
      });

    return selectAiChatUsage({ limits: enforcedLimits, consumptionById });
  }

  // A member credits failure must not hide the workspace or limit usage
  private async findMemberCredits({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<AiChatMemberCreditsDTO | null> {
    if (!isNonEmptyString(userWorkspaceId)) {
      return null;
    }

    try {
      return buildAiChatMemberCredits(
        await this.usageLimitQuotaService.getMemberAllowanceUsage({
          workspaceId,
          userWorkspaceId,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Member credits usage unavailable for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return null;
    }
  }
}
