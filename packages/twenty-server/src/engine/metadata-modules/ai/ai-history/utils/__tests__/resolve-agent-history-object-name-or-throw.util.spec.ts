import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { resolveAgentHistoryObjectNameOrThrow } from 'src/engine/metadata-modules/ai/ai-history/utils/resolve-agent-history-object-name-or-throw.util';
import { getStandardFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

describe('resolveAgentHistoryObjectNameOrThrow', () => {
  it.each([
    {
      objectName: 'agentChatThread',
      renamedObjectName: 'inboxThread',
    },
    {
      objectName: 'agentTurn',
      renamedObjectName: 'executionTurn',
    },
    {
      objectName: 'agentMessage',
      renamedObjectName: 'inboxMessage',
    },
    {
      objectName: 'agentMessagePart',
      renamedObjectName: 'inboxMessagePart',
    },
  ] as const)(
    'resolves $objectName before and after a metadata rename',
    ({ objectName, renamedObjectName }) => {
      const universalIdentifier =
        STANDARD_OBJECTS[objectName].universalIdentifier;

      for (const nameSingular of [objectName, renamedObjectName]) {
        expect(
          resolveAgentHistoryObjectNameOrThrow({
            objectName,
            flatObjectMetadataMaps: {
              byUniversalIdentifier: {
                [universalIdentifier]: getStandardFlatObjectMetadataMock({
                  universalIdentifier,
                  nameSingular,
                }),
              },
            },
          }),
        ).toBe(nameSingular);
      }
    },
  );

  it('fails when the object metadata is unavailable', () => {
    expect(() =>
      resolveAgentHistoryObjectNameOrThrow({
        objectName: 'agentChatThread',
        flatObjectMetadataMaps: { byUniversalIdentifier: {} },
      }),
    ).toThrow(AgentHistoryStorageException);
  });

  it('does not select another object with the same name', () => {
    const unrelatedUniversalIdentifier =
      STANDARD_OBJECTS.person.universalIdentifier;

    expect(() =>
      resolveAgentHistoryObjectNameOrThrow({
        objectName: 'agentChatThread',
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [unrelatedUniversalIdentifier]: getStandardFlatObjectMetadataMock({
              universalIdentifier: unrelatedUniversalIdentifier,
              nameSingular: 'agentChatThread',
            }),
          },
        },
      }),
    ).toThrow(AgentHistoryStorageException);
  });
});
