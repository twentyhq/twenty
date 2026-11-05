import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { lockAgentChatChannelForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-thread-write-or-throw.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const CHANNEL_ID = '20202020-0000-4000-8000-00000000000a';

const TRY_SHARED_LOCK_QUERY =
  'SELECT pg_try_advisory_xact_lock_shared(hashtextextended($1, 0)) AS "isLocked"';

describe('lockAgentChatChannelForThreadWriteOrThrow', () => {
  it('refuses while a deletion holds the channel', async () => {
    const query = jest.fn().mockResolvedValueOnce([{ isLocked: false }]);
    const existsBy = jest.fn();

    await expect(
      lockAgentChatChannelForThreadWriteOrThrow({
        transactionScope: { executeRawQuery: query },
        channelRepository: { existsBy },
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
    expect(existsBy).not.toHaveBeenCalled();
  });

  it('refuses once the channel row is gone', async () => {
    const query = jest.fn().mockResolvedValueOnce([{ isLocked: true }]);
    const existsBy = jest.fn().mockResolvedValueOnce(false);

    await expect(
      lockAgentChatChannelForThreadWriteOrThrow({
        transactionScope: { executeRawQuery: query },
        channelRepository: { existsBy },
        workspaceId: WORKSPACE_ID,
        channelId: CHANNEL_ID,
      }),
    ).rejects.toEqual(
      expect.objectContaining({ code: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND }),
    );
  });

  it('checks the channel after taking the lock', async () => {
    const query = jest.fn().mockResolvedValueOnce([{ isLocked: true }]);
    const existsBy = jest.fn().mockResolvedValueOnce(true);

    await lockAgentChatChannelForThreadWriteOrThrow({
      transactionScope: { executeRawQuery: query },
      channelRepository: { existsBy },
      workspaceId: WORKSPACE_ID,
      channelId: CHANNEL_ID,
    });

    expect(existsBy).toHaveBeenCalledWith(WORKSPACE_ID, { id: CHANNEL_ID });
    expect(query.mock.invocationCallOrder[0]).toBeLessThan(
      existsBy.mock.invocationCallOrder[0],
    );
  });
});
