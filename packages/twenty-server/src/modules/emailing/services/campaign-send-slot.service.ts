import { Injectable } from '@nestjs/common';

import { SEND_SLOT_RETRY } from 'src/engine/core-modules/emailing-domain/constants/send-slot-retry.constant';
import { type SendSlotRefusal } from 'src/engine/core-modules/emailing-domain/types/send-slot-refusal.type';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitSpeedService } from 'src/engine/core-modules/usage-limit/services/usage-limit-speed.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class CampaignSendSlotService {
  constructor(
    private readonly usageLimitSpeedService: UsageLimitSpeedService,
  ) {}

  // Returns null when the slots were consumed, or how long to wait when the
  // workspace token bucket refused them.
  async findSendSlotRefusal({
    workspaceId,
    requestedSlotCount = 1,
  }: {
    workspaceId: string;
    requestedSlotCount?: number;
  }): Promise<SendSlotRefusal | null> {
    try {
      await this.usageLimitSpeedService.consumeOrThrow({
        resourceType: UsageResourceType.EMAIL,
        operationType: UsageOperationType.EMAIL_SEND,
        authContext: buildSystemAuthContext(workspaceId),
        cost: requestedSlotCount,
      });

      return null;
    } catch (error) {
      if (
        !(error instanceof UsageLimitException) ||
        error.code !== UsageLimitExceptionCode.RATE_LIMITED
      ) {
        throw error;
      }

      return {
        retryDelayMs: Math.max(
          error.exhaustedScope?.retryAfterMs ?? 0,
          SEND_SLOT_RETRY.minDelayMs,
        ),
        windowMs:
          error.exhaustedScope?.periodUnit === 'second'
            ? (error.exhaustedScope.periodCount ?? 0) * 1000
            : 0,
        limitValue: error.exhaustedScope?.limitValue ?? null,
      };
    }
  }
}
