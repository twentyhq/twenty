import { type AppMessageReplyRecipient } from 'src/engine/metadata-modules/message-channel/utils/build-app-message-reply-recipients.util';

// recipients picked by hand keep the name and record links Twenty already has for the same handle
export const withKnownParticipantIdentities = (
  recipients: AppMessageReplyRecipient[],
  knownParticipants: AppMessageReplyRecipient[],
): AppMessageReplyRecipient[] =>
  recipients.map(
    (recipient) =>
      knownParticipants.find(
        (participant) =>
          participant.handle.toLowerCase() === recipient.handle.toLowerCase(),
      ) ?? recipient,
  );
