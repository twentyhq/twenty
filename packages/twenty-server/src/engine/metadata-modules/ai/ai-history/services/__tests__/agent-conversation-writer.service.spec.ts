import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentHistoryTransactionService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-transaction.service';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const TURN_ID = 'turn-id';

const buildWriter = ({
  threadFieldIsNullable,
}: {
  threadFieldIsNullable: boolean | undefined;
}) => {
  const insert = jest
    .fn()
    .mockResolvedValue({ identifiers: [{ id: TURN_ID }] });
  const getOrRecompute = jest.fn().mockResolvedValue({
    flatFieldMetadataMaps: {
      byUniversalIdentifier: isDefined(threadFieldIsNullable)
        ? {
            [STANDARD_OBJECTS.agentTurn.fields.thread.universalIdentifier]: {
              isNullable: threadFieldIsNullable,
            },
          }
        : {},
    },
  });

  const writer = new AgentConversationWriterService(
    { insert } as unknown as AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    {} as AgentHistoryTransactionService,
    { getOrRecompute } as unknown as WorkspaceCacheService,
  );

  return { writer, insert, getOrRecompute };
};

describe('AgentConversationWriterService.insertTurn', () => {
  it('records a turn without a thread once the thread is optional', async () => {
    const { writer, insert } = buildWriter({ threadFieldIsNullable: true });

    await expect(
      writer.insertTurn({
        workspaceId: WORKSPACE_ID,
        threadId: null,
        agentId: null,
        status: AgentTurnStatus.RUNNING,
      }),
    ).resolves.toBe(TURN_ID);

    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ threadId: null }),
    );
  });

  it.each([false, undefined])(
    'refuses a turn without a thread while the thread is still required (isNullable: %s)',
    async (threadFieldIsNullable) => {
      const { writer, insert } = buildWriter({ threadFieldIsNullable });

      await expect(
        writer.insertTurn({
          workspaceId: WORKSPACE_ID,
          threadId: null,
          agentId: null,
          status: AgentTurnStatus.RUNNING,
        }),
      ).rejects.toMatchObject({
        code: AiExceptionCode.AI_RUN_UPGRADE_IN_PROGRESS,
      });

      expect(insert).not.toHaveBeenCalled();
    },
  );

  it('records a turn in a thread without reading the metadata', async () => {
    const { writer, insert, getOrRecompute } = buildWriter({
      threadFieldIsNullable: false,
    });

    await writer.insertTurn({
      workspaceId: WORKSPACE_ID,
      threadId: 'thread-id',
      agentId: 'agent-id',
      status: AgentTurnStatus.RUNNING,
    });

    expect(getOrRecompute).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledTimes(1);
  });
});
