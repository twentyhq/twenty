import { isNonEmptyString } from '@sniptt/guards';
import { MessageParticipantRole } from 'twenty-shared/types';

import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import {
  type MessageParticipant,
  type MessageWithParticipants,
} from 'src/modules/messaging/message-import-manager/types/message';
import { type PersistSentMessageInput } from 'src/modules/messaging/message-outbound-manager/types/persist-sent-message-input.type';
import { resolveOutboundThreadExternalId } from 'src/modules/messaging/message-outbound-manager/utils/resolve-outbound-thread-external-id.util';

export const formatSentMessage = (
  input: PersistSentMessageInput,
): MessageWithParticipants => {
  const senderHandle = input.connectedAccount.handle ?? '';

  const participants: MessageParticipant[] = [
    {
      role: MessageParticipantRole.FROM,
      handle: senderHandle,
      displayName: senderHandle,
    },
    ...input.recipients.to.map((handle) => ({
      role: MessageParticipantRole.TO,
      handle,
      displayName: handle,
    })),
    ...input.recipients.cc.map((handle) => ({
      role: MessageParticipantRole.CC,
      handle,
      displayName: handle,
    })),
    ...input.recipients.bcc.map((handle) => ({
      role: MessageParticipantRole.BCC,
      handle,
      displayName: handle,
    })),
  ];

  const headerMessageId = input.sendResult.headerMessageId;

  return {
    externalId: isNonEmptyString(input.sendResult.messageExternalId)
      ? input.sendResult.messageExternalId
      : headerMessageId,
    headerMessageId,
    messageThreadExternalId: resolveOutboundThreadExternalId({
      sendResult: input.sendResult,
      inReplyTo: input.inReplyTo,
    }),
    subject: input.subject,
    text: input.body,
    receivedAt: new Date(),
    direction: MessageDirection.OUTGOING,
    attachments: [],
    participants,
  };
};
