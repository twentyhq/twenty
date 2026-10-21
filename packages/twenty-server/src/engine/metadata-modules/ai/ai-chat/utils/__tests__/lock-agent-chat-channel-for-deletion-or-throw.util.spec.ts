import { QueryFailedError } from 'typeorm';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { AGENT_CHAT_CHANNEL_DELETION_LOCK_TIMEOUT_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-deletion-lock-timeout-ms.constant';
import { lockAgentChatChannelForDeletionOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-deletion-or-throw.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const CHANNEL_ID = '20202020-0000-4000-8000-00000000000a';

const buildQueryFailedError = (code: string) =>
  Object.assign(new QueryFailedError('SELECT', [], new Error(code)), { code });

describe('lockAgentChatChannelForDeletionOrThrow', () => {
  it('bounds the wait before taking the lock', async () => {
    const query = jest.fn().mockResolvedValue([]);

    await lockAgentChatChannelForDeletionOrThrow({
      manager: { query },
      workspaceId: WORKSPACE_ID,
      channelId: CHANNEL_ID,
    });

    expect(query.mock.calls).toEqual([
      [`SELECT set_config('lock_timeout', $1, true)`, ['5000ms']],
      [
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`agent-chat-channel-deletion:${WORKSPACE_ID}:${CHANNEL_ID}`],
      ],
    ]);
  });

  it('refuses with CHAT_CHANNEL_BUSY when the wait times out', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(buildQueryFailedError('55P03'));

    await expect(
      lockAgentChatChannelForDeletionOrThrow({
        manager: { query },
        workspaceId: WORKSPACE_ID,
        channelId: CHANNEL_ID,
      }),
    ).rejects.toEqual(
      expect.objectContaining({ code: AiExceptionCode.CHAT_CHANNEL_BUSY }),
    );
  });

  it('rethrows other failures', async () => {
    const connectionError = buildQueryFailedError('57P01');
    const query = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(connectionError);

    await expect(
      lockAgentChatChannelForDeletionOrThrow({
        manager: { query },
        workspaceId: WORKSPACE_ID,
        channelId: CHANNEL_ID,
      }),
    ).rejects.toBe(connectionError);
  });

  it('gives up before the database client times out', () => {
    expect(AGENT_CHAT_CHANNEL_DELETION_LOCK_TIMEOUT_MS).toBeLessThan(
      new ConfigVariables().PG_DATABASE_PRIMARY_TIMEOUT_MS,
    );
  });
});
