import { type AppMessageReplyRecipient } from 'src/engine/metadata-modules/message-channel/utils/build-app-message-reply-recipients.util';

export const withKnownParticipantIdentities = ({
  recipients,
  knownParticipants,
}: {
  recipients: AppMessageReplyRecipient[];
  knownParticipants: AppMessageReplyRecipient[];
}): AppMessageReplyRecipient[] =>
  recipients.map(
    (recipient) =>
      knownParticipants.find(
        (participant) =>
          participant.handle.toLowerCase() === recipient.handle.toLowerCase(),
      ) ?? recipient,
  );
