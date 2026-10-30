import { isNonEmptyString } from '@sniptt/guards';
import { type SendInboxMessageInput } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type NormalizedSendInboxMessageInput } from 'src/engine/metadata-modules/ai/ai-chat/types/normalized-send-inbox-message-input.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const throwInvalidInput = (message: string): never => {
  throw new AiException(message, AiExceptionCode.INVALID_INBOX_MESSAGE_INPUT);
};

const uniqueIds = (ids: string[] | null | undefined): string[] => [
  ...new Set(ids ?? []),
];

const uniqueRecordTargets = (
  recordTargets:
    | NormalizedSendInboxMessageInput['recordTargets']
    | null
    | undefined,
): NormalizedSendInboxMessageInput['recordTargets'] => [
  ...new Map(
    (recordTargets ?? []).map(({ objectNameSingular, recordId }) => [
      `${objectNameSingular}:${recordId}`,
      { objectNameSingular, recordId },
    ]),
  ).values(),
];

export const normalizeSendInboxMessageInput = ({
  workspaceMemberIds,
  mentionedWorkspaceMemberIds,
  threadKey,
  threadId,
  channelId,
  title,
  recordTargets,
  idempotencyKey,
  text,
  toolCall,
}: Omit<SendInboxMessageInput, 'toolCall'> & {
  toolCall?: unknown;
}): NormalizedSendInboxMessageInput => {
  const mentioned = uniqueIds(mentionedWorkspaceMemberIds);
  const recipients = uniqueIds([...(workspaceMemberIds ?? []), ...mentioned]);
  const message = {
    idempotencyKey,
    text,
    toolCall,
    workspaceMemberIds: recipients,
    mentionedWorkspaceMemberIds: mentioned,
    recordTargets: uniqueRecordTargets(recordTargets),
  };

  if (isDefined(threadId) && isDefined(threadKey)) {
    return throwInvalidInput(
      'Address the message with either threadKey or threadId, not both',
    );
  }

  if (isDefined(threadId) && isDefined(channelId)) {
    return throwInvalidInput(
      'channelId only applies with threadKey, when the conversation is created',
    );
  }

  if (isDefined(threadId)) {
    return { ...message, addressing: { threadId } };
  }

  if (!isDefined(threadKey)) {
    return throwInvalidInput('Address the message with threadKey or threadId');
  }

  if (!isNonEmptyString(title)) {
    return throwInvalidInput(
      'title is required with threadKey, for the conversation it may create',
    );
  }

  if (!isDefined(channelId) && recipients.length === 0) {
    return throwInvalidInput(
      'The message needs a recipient, a mentioned member, a channel or an existing conversation',
    );
  }

  return {
    ...message,
    addressing: {
      threadKey,
      title,
      channelId: channelId ?? undefined,
    },
  };
};
