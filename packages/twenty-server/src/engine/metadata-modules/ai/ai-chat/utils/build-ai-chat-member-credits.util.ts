import { isDefined } from 'twenty-shared/utils';

import { type MemberCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/member-credits-fallback-mode.type';
import { MemberCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-member-credits-fallback.enum';
import { type AiChatMemberCreditsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-member-credits.dto';

export const buildAiChatMemberCredits = (
  memberAllowanceUsage: {
    limitValue: number;
    consumedValue: number | null;
    periodEnd: Date;
    fallback: MemberCreditsFallbackMode;
  } | null,
): AiChatMemberCreditsDTO | null => {
  if (!isDefined(memberAllowanceUsage)) {
    return null;
  }

  const { limitValue, consumedValue, periodEnd, fallback } =
    memberAllowanceUsage;

  return {
    limitValue,
    consumedValue,
    periodEnd,
    fallback: MemberCreditsFallback[fallback],
    isUsingWorkspaceCredits:
      fallback === 'WORKSPACE_CREDITS' &&
      isDefined(consumedValue) &&
      consumedValue >= limitValue,
  };
};
