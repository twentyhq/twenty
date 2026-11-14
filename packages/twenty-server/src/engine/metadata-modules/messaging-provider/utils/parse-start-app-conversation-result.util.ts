import { type StartAppConversationResult } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { formatLogicFunctionResultIssues } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/format-logic-function-result-issues.util';
import { parseSendAppMessageResult } from 'src/engine/metadata-modules/messaging-provider/utils/parse-send-app-message-result.util';

const startAppConversationResultSchema = z.object({
  threadExternalId: z.string().trim().min(1).max(512),
  recipients: z
    .array(
      z.object({
        personId: z.uuid(),
        handle: z.string().trim().min(1),
      }),
    )
    .nullish(),
});

type ParseStartAppConversationResultOutcome =
  | { isValid: true; startedConversation: StartAppConversationResult }
  | { isValid: false; reason: string };

export const parseStartAppConversationResult = (
  data: unknown,
): ParseStartAppConversationResultOutcome => {
  const parsedSentMessage = parseSendAppMessageResult(data);

  if (!parsedSentMessage.isValid) {
    return parsedSentMessage;
  }

  const parsed = startAppConversationResultSchema.safeParse(data);

  if (!parsed.success) {
    return {
      isValid: false,
      reason: formatLogicFunctionResultIssues(parsed.error),
    };
  }

  const { threadExternalId, recipients } = parsed.data;

  return {
    isValid: true,
    startedConversation: {
      ...parsedSentMessage.sentMessage,
      threadExternalId,
      ...(isDefined(recipients) ? { recipients } : {}),
    },
  };
};
