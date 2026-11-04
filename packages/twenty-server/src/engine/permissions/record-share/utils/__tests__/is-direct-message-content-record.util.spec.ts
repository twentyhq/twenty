import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectRecord } from 'twenty-shared/types';

import { isDirectMessageContentRecord } from 'src/engine/permissions/record-share/utils/is-direct-message-content-record.util';

const createRecordFinder = (conversationType: string) => {
  const records: Record<string, ObjectRecord> = {
    thread: { id: 'thread', conversationType },
    message: { id: 'message', threadId: 'thread' },
    content: { id: 'content', threadId: 'thread', messageId: 'message' },
  };

  return async ({ recordId }: { recordId: string }) =>
    records[recordId] ?? null;
};

describe('isDirectMessageContentRecord', () => {
  it.each([
    { objectName: 'agentChatThread', recordId: 'thread' },
    { objectName: 'agentChatThreadParticipant', recordId: 'content' },
    { objectName: 'agentChatThreadTarget', recordId: 'content' },
    { objectName: 'agentTurn', recordId: 'content' },
    { objectName: 'agentMessage', recordId: 'message' },
    { objectName: 'agentMessagePart', recordId: 'content' },
    { objectName: 'agentMessageReaction', recordId: 'content' },
  ] as const)(
    'keeps sharing managed for direct-message $objectName records',
    async ({ objectName, recordId }) => {
      expect(
        await isDirectMessageContentRecord({
          flatObjectMetadata: STANDARD_OBJECTS[objectName],
          recordId,
          findRecord: createRecordFinder('DIRECT_MESSAGE'),
        }),
      ).toBe(true);
    },
  );

  it('preserves sharing for ordinary conversation messages', async () => {
    expect(
      await isDirectMessageContentRecord({
        flatObjectMetadata: STANDARD_OBJECTS.agentMessage,
        recordId: 'message',
        findRecord: createRecordFinder('STANDARD'),
      }),
    ).toBe(false);
  });

  it('keeps orphaned message content unshareable', async () => {
    expect(
      await isDirectMessageContentRecord({
        flatObjectMetadata: STANDARD_OBJECTS.agentMessagePart,
        recordId: 'content',
        findRecord: async () => null,
      }),
    ).toBe(true);
  });

  it('preserves independent sharing for other records created in a direct message', async () => {
    expect(
      await isDirectMessageContentRecord({
        flatObjectMetadata: STANDARD_OBJECTS.company,
        recordId: 'content',
        findRecord: createRecordFinder('DIRECT_MESSAGE'),
      }),
    ).toBe(false);
  });
});
