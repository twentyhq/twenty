import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';

const AGENT_TURN_FIELDS = STANDARD_OBJECTS.agentTurn.fields;

const buildWriter = ({
  isThreadNullable,
  hasResultField,
  turnRepository = {},
}: {
  isThreadNullable: boolean;
  hasResultField: boolean;
  turnRepository?: Record<string, unknown>;
}) =>
  new AgentConversationWriterService(
    turnRepository as never,
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

  it('refuses a turn without a thread before inserting anything while the upgrade runs', async () => {
    const turnRepository = { insert: jest.fn() };

    await expect(
      buildWriter({
        isThreadNullable: false,
        hasResultField: false,
        turnRepository,
      }).insertTurn({
        workspaceId: 'workspace-id',
        threadId: null,
        agentId: null,
        status: AgentTurnStatus.RUNNING,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS });
    expect(turnRepository.insert).not.toHaveBeenCalled();
  });
});
