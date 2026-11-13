import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

type ThreadMessageReadState = {
  associationId: string;
  isRead: boolean;
  direction: MessageDirection;
  receivedAt: Date | null;
};

export const computeAppMessageThreadReadStateUpdate = ({
  threadMessages,
  isRead,
}: {
  threadMessages: ThreadMessageReadState[];
  isRead: boolean;
}): string[] => {
  if (isRead) {
    return threadMessages
      .filter((threadMessage) => !threadMessage.isRead)
      .map((threadMessage) => threadMessage.associationId);
  }

  const incomingMessages = threadMessages.filter(
    (threadMessage) => threadMessage.direction === MessageDirection.INCOMING,
  );

  if (incomingMessages.some((threadMessage) => !threadMessage.isRead)) {
    return [];
  }

  const [latestIncomingMessage] = incomingMessages.sort(
    (left, right) =>
      (right.receivedAt?.getTime() ?? 0) - (left.receivedAt?.getTime() ?? 0),
  );

  return latestIncomingMessage ? [latestIncomingMessage.associationId] : [];
};
