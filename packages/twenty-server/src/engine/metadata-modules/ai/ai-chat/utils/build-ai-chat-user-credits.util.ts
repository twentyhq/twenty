import { isDefined } from 'twenty-shared/utils';

import { UserCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-user-credits-fallback.enum';
import { type AiChatUserCreditsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-user-credits.dto';

export const buildAiChatUserCredits = (
  userAllowanceUsage: {
    limitValue: number;
    consumedValue: number | null;
    periodEnd: Date;
    fallback: UserCreditsFallback;
  } | null,
): AiChatUserCreditsDTO | null => {
  if (!isDefined(userAllowanceUsage)) {
    return null;
  }

  const { limitValue, consumedValue, periodEnd, fallback } = userAllowanceUsage;

  return {
    limitValue,
    consumedValue,
    periodEnd,
    fallback,
    isUsingWorkspaceCredits:
      fallback === UserCreditsFallback.WORKSPACE_CREDITS &&
      isDefined(consumedValue) &&
      consumedValue >= limitValue,
  };
};
