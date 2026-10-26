import { type SendAppMessageResult } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { formatLogicFunctionResultIssues } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/format-logic-function-result-issues.util';
import { isValidDate } from 'src/utils/date/isValidDate';

const sendAppMessageResultSchema = z.object({
  externalId: z.string().trim().min(1).max(512),
  sentAt: z.union([z.string(), z.number()]).nullish(),
});

const EPOCH_MILLISECONDS_THRESHOLD = 1e11;

type ParseSendAppMessageResultOutcome =
  | { isValid: true; sentMessage: SendAppMessageResult }
  | { isValid: false; reason: string };

const toIsoDateOrUndefined = (
  value: string | number | null | undefined,
): string | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  const date = new Date(
    typeof value === 'number' && value < EPOCH_MILLISECONDS_THRESHOLD
      ? value * 1000
      : value,
  );

  return isValidDate(date) ? date.toISOString() : undefined;
};

export const parseSendAppMessageResult = (
  data: unknown,
): ParseSendAppMessageResultOutcome => {
  const parsed = sendAppMessageResultSchema.safeParse(data);

  if (!parsed.success) {
    return {
      isValid: false,
      reason: formatLogicFunctionResultIssues(parsed.error),
    };
  }

  const { externalId } = parsed.data;
  const sentAt = toIsoDateOrUndefined(parsed.data.sentAt);

  return {
    isValid: true,
    sentMessage: isDefined(sentAt) ? { externalId, sentAt } : { externalId },
  };
};
