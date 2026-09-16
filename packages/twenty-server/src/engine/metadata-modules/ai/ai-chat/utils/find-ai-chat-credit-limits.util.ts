import { findLimitsForSpender } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-spender.util';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type UsageLimits } from 'src/engine/core-modules/usage-limit/types/usage-limits.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const findAiChatCreditLimits = ({
  usageLimits,
  userWorkspaceId,
}: {
  usageLimits: UsageLimits;
  userWorkspaceId: string;
}): FlatUsageLimit[] =>
  findLimitsForSpender({
    limits: (usageLimits.byResourceType[UsageResourceType.AI] ?? []).filter(
      (limit) =>
        limit.limitKind === 'quota' && limit.meter === 'creditsUsedMicro',
    ),
    spender: { spenderType: 'userWorkspace', spenderId: userWorkspaceId },
    operationType: UsageOperationType.AI_CHAT_TOKEN,
  });
