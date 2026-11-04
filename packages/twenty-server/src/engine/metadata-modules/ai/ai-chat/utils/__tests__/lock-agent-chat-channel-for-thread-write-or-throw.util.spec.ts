import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { lockAgentChatChannelForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-thread-write-or-throw.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const CHANNEL_ID = '20202020-0000-4000-8000-00000000000a';

const TRY_SHARED_LOCK_QUERY =
  'SELECT pg_try_advisory_xact_lock_shared(hashtextextended($1, 0)) AS "isLocked"';
const CHANNEL_EXISTS_QUERY =
  'SELECT id FROM core."agentChatChannel" WHERE id = $1 AND "workspaceId" = $2';

describe('lockAgentChatChannelForThreadWriteOrThrow', () => {
  it('refuses while a deletion holds the channel', async () => {
    const query = jest.fn().mockResolvedValueOnce([{ isLocked: false }]);

    await expect(
      lockAgentChatChannelForThreadWriteOrThrow({
        manager: { query },
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
  });

  it('refuses once the channel row is gone', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ isLocked: true }])
      .mockResolvedValueOnce([]);

    await expect(
      lockAgentChatChannelForThreadWriteOrThrow({
        manager: { query },
        workspaceId: WORKSPACE_ID,
        channelId: CHANNEL_ID,
      }),
    ).rejects.toEqual(
      expect.objectContaining({ code: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND }),
    );

    expect(query).toHaveBeenCalledTimes(2);
  });

  it('reads the channel row in a statement after the lock', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ isLocked: true }])
      .mockResolvedValueOnce([{ id: CHANNEL_ID }]);

    await lockAgentChatChannelForThreadWriteOrThrow({
      manager: { query },
      workspaceId: WORKSPACE_ID,
      channelId: CHANNEL_ID,
    });

    expect(query.mock.calls).toEqual([
      [
        TRY_SHARED_LOCK_QUERY,
        [`agent-chat-channel-deletion:${WORKSPACE_ID}:${CHANNEL_ID}`],
      ],
      [CHANNEL_EXISTS_QUERY, [CHANNEL_ID, WORKSPACE_ID]],
    ]);
  });
});
