import { MessageQuery } from 'src/modules/messaging/types/message-or-thread-query';

export const createQueriesFromMessageIds = (
  messageExternalIds: string[],
): MessageQuery[] => {
  return messageExternalIds.map((messageId) => ({
    uri: '/gmail/v1/users/me/messages/' + messageId + '?format=RAW',
  }));
};
