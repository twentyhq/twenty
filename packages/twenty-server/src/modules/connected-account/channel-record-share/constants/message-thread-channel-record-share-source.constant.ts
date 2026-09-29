import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MessageChannelVisibility } from 'twenty-shared/types';

import { type ChannelRecordShareSource } from 'src/modules/connected-account/channel-record-share/types/channel-record-share-source.type';

export const MESSAGE_THREAD_CHANNEL_RECORD_SHARE_SOURCE: ChannelRecordShareSource =
  {
    channelTableName: 'messageChannel',
    shareEverythingVisibility: MessageChannelVisibility.SHARE_EVERYTHING,
    recordObjectUniversalIdentifier:
      STANDARD_OBJECTS.messageThread.universalIdentifier,
    buildChannelRecordIdsQuery: (schemaName) =>
      `SELECT message."messageThreadId" AS "recordId"
       FROM ${schemaName}."messageChannelMessageAssociation" association
       JOIN ${schemaName}."message" message ON message.id = association."messageId"
       JOIN core."messageChannel" channel ON channel.id = association."messageChannelId"
         AND channel."workspaceId" = $1
       WHERE association."messageChannelId" = $2
         AND association."deletedAt" IS NULL
         AND message."messageThreadId" IS NOT NULL`,
  };
