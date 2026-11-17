import { type SendAppMessageResult } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { z } from 'zod';

import { formatLogicFunctionResultIssues } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/format-logic-function-result-issues.util';
import { isValidDate } from 'src/utils/date/isValidDate';

const externalIdSchema = z.string().trim().min(1).max(512);

const sentAtSchema = z.union([z.string(), z.number()]).nullish();

const attachmentIndexSchema = z.number().int().min(0);

const sendAppMessageResultSchema = z.object({
  externalId: externalIdSchema,
  sentAt: sentAtSchema,
  splitAttachments: z
    .array(
      z.object({
        attachmentIndex: attachmentIndexSchema,
        externalId: externalIdSchema,
        sentAt: sentAtSchema,
      }),
    )
    .nullish(),
  rejectedAttachmentIndexes: z.array(attachmentIndexSchema).nullish(),
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

export const parseSendAppMessageResult = ({
  data,
  attachmentCount,
}: {
  data: unknown;
  attachmentCount: number;
}): ParseSendAppMessageResultOutcome => {
  const parsed = sendAppMessageResultSchema.safeParse(data);

  if (!parsed.success) {
    return {
      isValid: false,
      reason: formatLogicFunctionResultIssues(parsed.error),
    };
  }

  const { externalId } = parsed.data;
  const sentAt = toIsoDateOrUndefined(parsed.data.sentAt);

  const splitAttachments = (parsed.data.splitAttachments ?? []).map(
    (splitAttachment) => {
      const splitSentAt = toIsoDateOrUndefined(splitAttachment.sentAt);

      return {
        attachmentIndex: splitAttachment.attachmentIndex,
        externalId: splitAttachment.externalId,
        ...(isDefined(splitSentAt) && { sentAt: splitSentAt }),
      };
    },
  );
  const rejectedAttachmentIndexes = parsed.data.rejectedAttachmentIndexes ?? [];

  const referencedAttachmentIndexes = [
    ...splitAttachments.map(({ attachmentIndex }) => attachmentIndex),
    ...rejectedAttachmentIndexes,
  ];

  if (referencedAttachmentIndexes.some((index) => index >= attachmentCount)) {
    return {
      isValid: false,
      reason: `an attachment index is out of the ${attachmentCount} attachment(s) sent`,
    };
  }

  if (
    new Set(referencedAttachmentIndexes).size !==
    referencedAttachmentIndexes.length
  ) {
    return {
      isValid: false,
      reason: 'an attachment is reported more than once',
    };
  }

  const messageExternalIds = [
    externalId,
    ...splitAttachments.map((splitAttachment) => splitAttachment.externalId),
  ];

  if (new Set(messageExternalIds).size !== messageExternalIds.length) {
    return {
      isValid: false,
      reason: 'two sent messages share an external id',
    };
  }

  return {
    isValid: true,
    sentMessage: {
      externalId,
      ...(isDefined(sentAt) && { sentAt }),
      ...(isNonEmptyArray(splitAttachments) && { splitAttachments }),
      ...(isNonEmptyArray(rejectedAttachmentIndexes) && {
        rejectedAttachmentIndexes,
      }),
    },
  };
};
