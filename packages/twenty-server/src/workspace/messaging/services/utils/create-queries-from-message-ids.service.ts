import { Injectable } from '@nestjs/common';

import { MessageQuery } from 'src/workspace/messaging/types/message-or-thread-query';

@Injectable()
export class CreateQueriesFromMessageIdsService {
  constructor() {}

  public createQueriesFromMessageIds(
    messageExternalIds: string[],
  ): MessageQuery[] {
    return messageExternalIds.map((messageId) => ({
      uri: '/gmail/v1/users/me/messages/' + messageId + '?format=RAW',
    }));
  }
}
