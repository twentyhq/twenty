import { MessageChannelVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordShareInput } from 'src/engine/record-share/types/record-share-input.type';
import { buildChannelRecordShares } from 'src/engine/record-share/utils/build-channel-record-shares.util';
import { type MessageChannelRecordShareSource } from 'src/modules/messaging/common/types/message-channel-record-share-source.type';

const MESSAGE_CHANNEL_VISIBILITIES_SHARED_WITH_EVERYONE: MessageChannelVisibility[] =
  [
    MessageChannelVisibility.METADATA,
    MessageChannelVisibility.SUBJECT,
    MessageChannelVisibility.SHARE_EVERYTHING,
  ];

export const buildMessageRecordSharesToInsert = ({
  messageChannel,
  messages,
  messageObjectMetadataId,
  messageThreadObjectMetadataId,
}: {
  messageChannel: MessageChannelRecordShareSource;
  messages: { id: string; messageThreadId: string | null }[];
  messageObjectMetadataId: string;
  messageThreadObjectMetadataId: string;
}): RecordShareInput[] => {
  const messageIds = new Set(messages.map((message) => message.id));
  const messageThreadIds = new Set(
    messages.map((message) => message.messageThreadId).filter(isDefined),
  );

  return buildChannelRecordShares({
    sourceId: messageChannel.messageChannelId,
    ownerWorkspaceMemberId: messageChannel.ownerWorkspaceMemberId,
    isSharedWithEveryone:
      MESSAGE_CHANNEL_VISIBILITIES_SHARED_WITH_EVERYONE.includes(
        messageChannel.visibility,
      ),
    records: [
      ...Array.from(messageIds, (recordId) => ({
        recordId,
        objectMetadataId: messageObjectMetadataId,
      })),
      ...Array.from(messageThreadIds, (recordId) => ({
        recordId,
        objectMetadataId: messageThreadObjectMetadataId,
      })),
    ],
  });
};
