import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  MessageChannelVisibility,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { buildMessageRecordSharesToInsert } from 'src/modules/messaging/common/utils/build-message-record-shares-to-insert.util';

const MESSAGE_CHANNEL_ID = 'message-channel-1';
const OWNER_WORKSPACE_MEMBER_ID = 'workspace-member-1';
const MESSAGE_OBJECT_METADATA_ID = 'message-object';
const MESSAGE_THREAD_OBJECT_METADATA_ID = 'message-thread-object';

const ownerRow = (recordId: string, objectMetadataId: string) => ({
  recordId,
  objectMetadataId,
  principalId: OWNER_WORKSPACE_MEMBER_ID,
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.FULL,
  rowCause: RecordShareRowCause.APPLICATION,
  sourceId: MESSAGE_CHANNEL_ID,
});

const everyoneRow = (recordId: string, objectMetadataId: string) => ({
  recordId,
  objectMetadataId,
  principalId: EVERYONE_PRINCIPAL_ID,
  principalType: RecordSharePrincipalType.EVERYONE,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.APPLICATION,
  sourceId: MESSAGE_CHANNEL_ID,
});

describe('buildMessageRecordSharesToInsert', () => {
  it('should give the owner FULL and everyone READ on each message and on their thread once', () => {
    expect(
      buildMessageRecordSharesToInsert({
        messageChannel: {
          messageChannelId: MESSAGE_CHANNEL_ID,
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          ownerWorkspaceMemberId: OWNER_WORKSPACE_MEMBER_ID,
        },
        messages: [
          { id: 'message-1', messageThreadId: 'thread-1' },
          { id: 'message-2', messageThreadId: 'thread-1' },
        ],
        messageObjectMetadataId: MESSAGE_OBJECT_METADATA_ID,
        messageThreadObjectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
      }),
    ).toEqual([
      ownerRow('message-1', MESSAGE_OBJECT_METADATA_ID),
      everyoneRow('message-1', MESSAGE_OBJECT_METADATA_ID),
      ownerRow('message-2', MESSAGE_OBJECT_METADATA_ID),
      everyoneRow('message-2', MESSAGE_OBJECT_METADATA_ID),
      ownerRow('thread-1', MESSAGE_THREAD_OBJECT_METADATA_ID),
      everyoneRow('thread-1', MESSAGE_THREAD_OBJECT_METADATA_ID),
    ]);
  });

  it.each([
    MessageChannelVisibility.METADATA,
    MessageChannelVisibility.SUBJECT,
  ])('should keep the everyone row under %s visibility', (visibility) => {
    expect(
      buildMessageRecordSharesToInsert({
        messageChannel: {
          messageChannelId: MESSAGE_CHANNEL_ID,
          visibility,
          ownerWorkspaceMemberId: OWNER_WORKSPACE_MEMBER_ID,
        },
        messages: [{ id: 'message-1', messageThreadId: 'thread-1' }],
        messageObjectMetadataId: MESSAGE_OBJECT_METADATA_ID,
        messageThreadObjectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
      }),
    ).toEqual([
      ownerRow('message-1', MESSAGE_OBJECT_METADATA_ID),
      everyoneRow('message-1', MESSAGE_OBJECT_METADATA_ID),
      ownerRow('thread-1', MESSAGE_THREAD_OBJECT_METADATA_ID),
      everyoneRow('thread-1', MESSAGE_THREAD_OBJECT_METADATA_ID),
    ]);
  });

  it('should write no owner row when the owner has no workspace member', () => {
    expect(
      buildMessageRecordSharesToInsert({
        messageChannel: {
          messageChannelId: MESSAGE_CHANNEL_ID,
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          ownerWorkspaceMemberId: null,
        },
        messages: [{ id: 'message-1', messageThreadId: 'thread-1' }],
        messageObjectMetadataId: MESSAGE_OBJECT_METADATA_ID,
        messageThreadObjectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
      }),
    ).toEqual([
      everyoneRow('message-1', MESSAGE_OBJECT_METADATA_ID),
      everyoneRow('thread-1', MESSAGE_THREAD_OBJECT_METADATA_ID),
    ]);
  });

  it('should skip the thread rows of a message without thread and deduplicate messages', () => {
    expect(
      buildMessageRecordSharesToInsert({
        messageChannel: {
          messageChannelId: MESSAGE_CHANNEL_ID,
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          ownerWorkspaceMemberId: OWNER_WORKSPACE_MEMBER_ID,
        },
        messages: [
          { id: 'message-1', messageThreadId: null },
          { id: 'message-1', messageThreadId: null },
        ],
        messageObjectMetadataId: MESSAGE_OBJECT_METADATA_ID,
        messageThreadObjectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
      }),
    ).toEqual([
      ownerRow('message-1', MESSAGE_OBJECT_METADATA_ID),
      everyoneRow('message-1', MESSAGE_OBJECT_METADATA_ID),
    ]);
  });

  it('should return an empty array without messages', () => {
    expect(
      buildMessageRecordSharesToInsert({
        messageChannel: {
          messageChannelId: MESSAGE_CHANNEL_ID,
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          ownerWorkspaceMemberId: OWNER_WORKSPACE_MEMBER_ID,
        },
        messages: [],
        messageObjectMetadataId: MESSAGE_OBJECT_METADATA_ID,
        messageThreadObjectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
      }),
    ).toEqual([]);
  });
});
