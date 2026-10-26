import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { type AppMessageInput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';
import { canonicalizePersonHandle } from 'src/modules/match-participant/person-handle-field/utils/canonicalize-person-handle.util';

// stored canonical so a person change finds these participants by exact handle, whatever format the provider sent
export const withCanonicalParticipantHandlesOrThrow = ({
  message,
  personHandleField,
}: {
  message: AppMessageInput;
  personHandleField: Pick<PersonHandleField, 'type'>;
}): AppMessageInput => {
  // spellings of one handle collapse to the same canonical form, which must stay one participant per role
  const participantsByRoleAndHandle = new Map<
    string,
    AppMessageInput['participants'][number]
  >();

  for (const participant of message.participants) {
    const handle = canonicalizePersonHandle({
      type: personHandleField.type,
      value: participant.handle,
    });

    if (!isDefined(handle)) {
      throw new MessageChannelException(
        `Participant handle ${participant.handle} on message ${message.externalId} is not a valid ${personHandleField.type} value`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const key = `${participant.role}:${handle}`;
    const earlierParticipant = participantsByRoleAndHandle.get(key);
    const earlierDisplayName = earlierParticipant?.displayName;

    participantsByRoleAndHandle.set(key, {
      role: participant.role,
      handle,
      displayName: isNonEmptyString(earlierDisplayName)
        ? earlierDisplayName
        : participant.displayName,
      personId: earlierParticipant?.personId ?? participant.personId,
      workspaceMemberId:
        earlierParticipant?.workspaceMemberId ?? participant.workspaceMemberId,
    });
  }

  return {
    ...message,
    participants: [...participantsByRoleAndHandle.values()],
  };
};
