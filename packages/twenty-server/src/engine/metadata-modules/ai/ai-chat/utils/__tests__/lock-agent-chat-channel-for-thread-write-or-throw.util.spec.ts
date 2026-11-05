import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { lockAgentChatChannelForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-thread-write-or-throw.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const CHANNEL_ID = '20202020-0000-4000-8000-00000000000a';

const TRY_SHARED_LOCK_QUERY =
  'SELECT pg_try_advisory_xact_lock_shared(hashtextextended($1, 0)) AS "isLocked"';

describe('lockAgentChatChannelForThreadWriteOrThrow', () => {
  it('refuses while a deletion holds the channel', async () => {
    const query = jest.fn().mockResolvedValueOnce([{ isLocked: false }]);
    const getRepository = jest.fn();

    await expect(
      lockAgentChatChannelForThreadWriteOrThrow({
        manager: { query, getRepository },
        workspaceId: WORKSPACE_ID,
        channelId: CHANNEL_ID,
      }),
    ).rejects.toEqual(
      expect.objectContaining({ code: AiExceptionCode.CHAT_CHANNEL_BUSY }),
    );

    expect(query.mock.calls).toEqual([
      [
        TRY_SHARED_LOCK_QUERY,
        [`agent-chat-channel-deletion:${WORKSPACE_ID}:${CHANNEL_ID}`],
      ],
    ]);
    expect(getRepository).not.toHaveBeenCalled();
  });

  it('refuses once the channel row is gone', async () => {
    const query = jest.fn().mockResolvedValueOnce([{ isLocked: true }]);
    const existsBy = jest.fn().mockResolvedValue(false);
    const getRepository = jest.fn().mockReturnValue({ existsBy });

    await expect(
      lockAgentChatChannelForThreadWriteOrThrow({
        manager: { query, getRepository },
        workspaceId: WORKSPACE_ID,
        channelId: CHANNEL_ID,
      }),
    ).rejects.toEqual(
      expect.objectContaining({ code: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND }),
    );

    expect(query).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenCalledWith({
      id: CHANNEL_ID,
      workspaceId: WORKSPACE_ID,
    });
  });

  it('reads the channel row in a statement after the lock', async () => {
    const query = jest.fn().mockResolvedValueOnce([{ isLocked: true }]);
    const existsBy = jest.fn().mockResolvedValue(true);
    const getRepository = jest.fn().mockReturnValue({ existsBy });

    await lockAgentChatChannelForThreadWriteOrThrow({
      manager: { query, getRepository },
      workspaceId: WORKSPACE_ID,
      channelId: CHANNEL_ID,
    });

    expect(query.mock.calls).toEqual([
      [
        TRY_SHARED_LOCK_QUERY,
        [`agent-chat-channel-deletion:${WORKSPACE_ID}:${CHANNEL_ID}`],
      ],
    ]);
    expect(getRepository).toHaveBeenCalledWith(AgentChatChannelEntity);
    expect(existsBy).toHaveBeenCalledWith({
      id: CHANNEL_ID,
      workspaceId: WORKSPACE_ID,
    });
    expect(query.mock.invocationCallOrder[0]).toBeLessThan(
      existsBy.mock.invocationCallOrder[0],
    );
  });
});
