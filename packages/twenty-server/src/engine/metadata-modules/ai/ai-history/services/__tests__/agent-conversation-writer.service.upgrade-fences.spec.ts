import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';

const AGENT_TURN_FIELDS = STANDARD_OBJECTS.agentTurn.fields;

const buildWriter = ({
  isThreadNullable,
  hasResultField,
}: {
  isThreadNullable: boolean;
  hasResultField: boolean;
}) =>
  new AgentConversationWriterService(
    {} as never,
    {} as never,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            [AGENT_TURN_FIELDS.thread.universalIdentifier]: {
              isNullable: isThreadNullable,
            },
            ...(hasResultField
              ? { [AGENT_TURN_FIELDS.result.universalIdentifier]: {} }
              : {}),
          },
        },
      }),
    } as never,
  );

describe('AgentConversationWriterService upgrade fences', () => {
  it.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [true, true, true],
  ])(
    'lets a turn go without a thread only once both commands ran (thread optional: %s, result field: %s)',
    async (isThreadNullable, hasResultField, expected) => {
      await expect(
        buildWriter({
          isThreadNullable,
          hasResultField,
        }).canInsertTurnWithoutThread('workspace-id'),
      ).resolves.toBe(expected);
    },
  );

  it.each([
    [false, false],
    [true, true],
  ])(
    'stores a turn result only where the result field exists (result field: %s)',
    async (hasResultField, expected) => {
      await expect(
        buildWriter({
          isThreadNullable: false,
          hasResultField,
        }).canStoreTurnResult('workspace-id'),
      ).resolves.toBe(expected);
    },
  );
});
