import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatUserCreditsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-user-credits.dto';
import { type AiChatUsageDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-usage.dto';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { buildAiChatUserCredits } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-ai-chat-user-credits.util';
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
    const [usage, userCredits] = await Promise.all([
      this.findWorkspaceOrLimitUsage({ workspaceId, userWorkspaceId }),
      this.findUserCredits({ workspaceId, userWorkspaceId }),
    ]);

    return isDefined(usage) ? { ...usage, userCredits } : null;
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
      const workspaceAllowanceUsage =
        await this.usageLimitQuotaService.getWorkspaceAllowanceUsage(
          workspaceId,
        );

      return isDefined(workspaceAllowanceUsage)
        ? { ...workspaceAllowanceUsage, kind: 'workspaceAllowance' }
        : null;
    }

    const consumptionById =
      await this.usageLimitQuotaService.readLimitConsumptions({
        workspaceId,
        limits: enforcedLimits,
      });

    return selectAiChatUsage({ limits: enforcedLimits, consumptionById });
  }

  // A user credits failure must not hide the workspace or limit usage
  private async findUserCredits({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<AiChatUserCreditsDTO | null> {
    if (!isNonEmptyString(userWorkspaceId)) {
      return null;
    }

    try {
      return buildAiChatUserCredits(
        await this.usageLimitQuotaService.getUserAllowanceUsage({
          workspaceId,
          userWorkspaceId,
        }),
      );
    } catch (error) {
      this.logger.error(
        `User credits usage unavailable for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return null;
    }
  }
}
