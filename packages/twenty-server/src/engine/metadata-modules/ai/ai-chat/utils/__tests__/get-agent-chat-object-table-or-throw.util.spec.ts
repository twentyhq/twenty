import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAgentChatObjectTableOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-object-table-or-throw.util';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { getStandardFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const WORKSPACE_ID = '20202020-1212-4121-8121-202020202020';

describe('getAgentChatObjectTableOrThrow', () => {
  it.each([
    { objectName: 'agentChatThread', nameSingular: 'inboxThread' },
    {
      objectName: 'agentChatThreadParticipant',
      nameSingular: 'inboxThreadParticipant',
    },
    { objectName: 'agentChatThreadTarget', nameSingular: 'inboxThreadTarget' },
    {
      objectName: 'agentMessageReaction',
      nameSingular: 'inboxMessageReaction',
    },
  ] as const)(
    'uses the current workspace name of $objectName',
    ({ objectName, nameSingular }) => {
      const universalIdentifier =
        STANDARD_OBJECTS[objectName].universalIdentifier;
      const unrelatedUniversalIdentifier =
        STANDARD_OBJECTS.person.universalIdentifier;

      expect(
        getAgentChatObjectTableOrThrow({
          workspaceId: WORKSPACE_ID,
          objectName,
          flatObjectMetadataMaps: {
            byUniversalIdentifier: {
              [universalIdentifier]: getStandardFlatObjectMetadataMock({
                universalIdentifier,
                nameSingular,
              }),
              [unrelatedUniversalIdentifier]: getStandardFlatObjectMetadataMock(
                {
                  universalIdentifier: unrelatedUniversalIdentifier,
                  nameSingular: objectName,
                },
              ),
            },
          },
        }),
      ).toBe(`"${getWorkspaceSchemaName(WORKSPACE_ID)}"."${nameSingular}"`);
    },
  );

  it('fails when the requested standard object is absent', () => {
    expect(() =>
      getAgentChatObjectTableOrThrow({
        workspaceId: WORKSPACE_ID,
        objectName: 'agentChatThreadParticipant',
        flatObjectMetadataMaps: { byUniversalIdentifier: {} },
      }),
    ).toThrow(AgentHistoryStorageException);
  });
});
