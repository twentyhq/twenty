import { isNonEmptyString } from '@sniptt/guards';
import { MessageParticipantRole } from 'twenty-shared/types';

import { type AppMessageParticipantInput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export type AppMessageReplyRecipient = Omit<AppMessageParticipantInput, 'role'>;

// participants come newest first, so a later display name or identity link wins, and an older one fills what it omits
export const buildAppMessageReplyRecipients = ({
  participants,
  channelHandle,
}: {
  participants: Pick<
    MessageParticipantWorkspaceEntity,
    'handle' | 'displayName' | 'personId' | 'workspaceMemberId' | 'role'
  >[];
  channelHandle: string;
}): AppMessageReplyRecipient[] => {
  const recipientsByHandle = new Map<string, AppMessageReplyRecipient>();

  for (const participant of participants) {
    if (
      !isNonEmptyString(participant.handle) ||
      participant.role === MessageParticipantRole.BCC
    ) {
      continue;
    }

    const handleKey = participant.handle.toLowerCase();

    if (handleKey === channelHandle.toLowerCase()) {
      continue;
    }

    const newerRecipient = recipientsByHandle.get(handleKey);

    recipientsByHandle.set(handleKey, {
      handle: newerRecipient?.handle ?? participant.handle,
      displayName:
        newerRecipient?.displayName ??
        (isNonEmptyString(participant.displayName)
          ? participant.displayName
          : undefined),
      personId: newerRecipient?.personId ?? participant.personId ?? undefined,
      workspaceMemberId:
        newerRecipient?.workspaceMemberId ??
        participant.workspaceMemberId ??
        undefined,
    });
  }

  return [...recipientsByHandle.values()];
};
