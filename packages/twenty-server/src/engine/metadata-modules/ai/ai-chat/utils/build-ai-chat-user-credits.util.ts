import { isDefined } from 'twenty-shared/utils';

import { type UserCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/user-credits-fallback-mode.type';
import { UserCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-user-credits-fallback.enum';
import { type AiChatUserCreditsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-user-credits.dto';

export const buildAiChatUserCredits = (
  userAllowanceUsage: {
    limitValue: number;
    consumedValue: number | null;
    periodEnd: Date;
    fallback: UserCreditsFallbackMode;
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
    fallback: UserCreditsFallback[fallback],
    isUsingWorkspaceCredits:
      fallback === 'WORKSPACE_CREDITS' &&
      isDefined(consumedValue) &&
      consumedValue >= limitValue,
  };
};
