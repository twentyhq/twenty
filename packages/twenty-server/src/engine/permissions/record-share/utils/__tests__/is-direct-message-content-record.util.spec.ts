import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isDirectMessageContentRecord } from 'src/engine/permissions/record-share/utils/is-direct-message-content-record.util';

const createRecordFinder = (conversationType: string) => {
  const records: Record<string, Record<string, ObjectRecord>> = {
    agentChatThread: { thread: { id: 'thread', conversationType } },
    agentChatThreadParticipant: {
      participant: { id: 'participant', threadId: 'thread' },
    },
    agentChatThreadTarget: {
      target: { id: 'target', threadId: 'thread' },
    },
    agentTurn: { turn: { id: 'turn', threadId: 'thread' } },
    agentMessage: { message: { id: 'message', threadId: 'thread' } },
    agentMessagePart: { part: { id: 'part', messageId: 'message' } },
    agentMessageReaction: {
      reaction: { id: 'reaction', messageId: 'message' },
    },
  };

  return async ({
    objectName,
    recordId,
    select,
  }: {
    objectName: string;
    recordId: string;
    select: string[];
  }) => {
    const record = records[objectName]?.[recordId];

    if (!isDefined(record)) {
      return null;
    }

    return {
      id: record.id,
      ...Object.fromEntries(
        select.map((fieldName) => [fieldName, record[fieldName]]),
      ),
    };
  };
};

describe('isDirectMessageContentRecord', () => {
  it.each([
    { objectName: 'agentChatThread', recordId: 'thread' },
    { objectName: 'agentChatThreadParticipant', recordId: 'participant' },
    { objectName: 'agentChatThreadTarget', recordId: 'target' },
    { objectName: 'agentTurn', recordId: 'turn' },
    { objectName: 'agentMessage', recordId: 'message' },
    { objectName: 'agentMessagePart', recordId: 'part' },
    { objectName: 'agentMessageReaction', recordId: 'reaction' },
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

  it.each([
    { objectName: 'agentMessage', recordId: 'message' },
    { objectName: 'agentMessagePart', recordId: 'part' },
    { objectName: 'agentMessageReaction', recordId: 'reaction' },
  ] as const)(
    'preserves sharing for ordinary conversation $objectName records',
    async ({ objectName, recordId }) => {
      expect(
        await isDirectMessageContentRecord({
          flatObjectMetadata: STANDARD_OBJECTS[objectName],
          recordId,
          findRecord: createRecordFinder('STANDARD'),
        }),
      ).toBe(false);
    },
  );

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
