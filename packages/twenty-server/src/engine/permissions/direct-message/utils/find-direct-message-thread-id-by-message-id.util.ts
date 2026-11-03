import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  type RowAccessEvaluationContext,
  type RowAccessRecord,
} from 'src/engine/permissions/combine/types/row-access-policy.type';

export const findDirectMessageThreadIdByMessageId = async ({
  context,
  records,
}: {
  context: Pick<RowAccessEvaluationContext, 'findRecords'>;
  records: RowAccessRecord[];
}): Promise<Map<string, string>> => {
  const messageIds = [
    ...new Set(
      records.map(({ messageId }) => messageId).filter(isNonEmptyString),
    ),
  ];

  if (!isNonEmptyArray(messageIds)) {
    return new Map();
  }

  const messages = await context.findRecords({
    objectUniversalIdentifier:
      STANDARD_OBJECTS.agentMessage.universalIdentifier,
    recordIds: messageIds,
    selectFields: ['id', 'threadId'],
  });

  return new Map(
    messages
      .filter((message): message is RowAccessRecord & { threadId: string } =>
        isNonEmptyString(message.threadId),
      )
      .map(({ id, threadId }) => [id, threadId]),
  );
};
