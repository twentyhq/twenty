import { isNonEmptyString } from '@sniptt/guards';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AppMessageParticipantInput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export type AppMessageReplyRecipient = Omit<AppMessageParticipantInput, 'role'>;

type ReplyParticipant = Pick<
  MessageParticipantWorkspaceEntity,
  | 'messageId'
  | 'handle'
  | 'displayName'
  | 'personId'
  | 'workspaceMemberId'
  | 'role'
>;

export const buildAppMessageReplyRecipients = ({
  participants,
  channelHandle,
}: {
  participants: ReplyParticipant[];
  channelHandle: string;
}): AppMessageReplyRecipient[] => {
  const isReplyable = (
    participant: ReplyParticipant,
  ): participant is ReplyParticipant & { handle: string } =>
    isNonEmptyString(participant.handle) &&
    participant.role !== MessageParticipantRole.BCC &&
    participant.handle.toLowerCase() !== channelHandle.toLowerCase();

  const replyableParticipants = participants.filter(isReplyable);

  const latestMessageId = replyableParticipants[0]?.messageId;

  const recipientsByHandle = new Map<string, AppMessageReplyRecipient>(
    replyableParticipants
      .filter((participant) => participant.messageId === latestMessageId)
      .map((participant) => [
        participant.handle.toLowerCase(),
        { handle: participant.handle },
      ]),
  );

  for (const participant of replyableParticipants) {
    const handleKey = participant.handle.toLowerCase();
    const newerRecipient = recipientsByHandle.get(handleKey);

    if (!isDefined(newerRecipient)) {
      continue;
    }

    recipientsByHandle.set(handleKey, {
      handle: newerRecipient.handle,
      displayName:
        newerRecipient.displayName ??
        (isNonEmptyString(participant.displayName)
          ? participant.displayName
          : undefined),
      personId: newerRecipient.personId ?? participant.personId ?? undefined,
      workspaceMemberId:
        newerRecipient.workspaceMemberId ??
        participant.workspaceMemberId ??
        undefined,
    });
  }

  return [...recipientsByHandle.values()];
};
