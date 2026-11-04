import { QueryFailedError } from 'typeorm';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { acquireAgentChatChannelGrantLocksForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks-for-thread-write-or-throw.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const FIRST_CHANNEL_ID = '20202020-0000-4000-8000-00000000000a';
const SECOND_CHANNEL_ID = '20202020-0000-4000-8000-00000000000b';

const SHARED_LOCK_QUERY =
  'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))';

const buildQueryFailedError = (code: string) =>
  Object.assign(new QueryFailedError('SELECT', [], new Error(code)), { code });

describe('acquireAgentChatChannelGrantLocksForThreadWriteOrThrow', () => {
  it('bounds the wait before taking the shared locks', async () => {
    const query = jest.fn().mockResolvedValue([]);

    await acquireAgentChatChannelGrantLocksForThreadWriteOrThrow({
      manager: { query },
      workspaceId: WORKSPACE_ID,
      channelIds: [SECOND_CHANNEL_ID, null, FIRST_CHANNEL_ID],
    });

    expect(query.mock.calls).toEqual([
      [`SELECT set_config('lock_timeout', $1, true)`, ['5000ms']],
      [
        SHARED_LOCK_QUERY,
        [`agent-chat-channel-grants:${WORKSPACE_ID}:${FIRST_CHANNEL_ID}`],
      ],
      [
        SHARED_LOCK_QUERY,
        [`agent-chat-channel-grants:${WORKSPACE_ID}:${SECOND_CHANNEL_ID}`],
      ],
    ]);
  });

  it('leaves the wait of a chat outside any channel unbounded', async () => {
    const query = jest.fn().mockResolvedValue([]);

    await acquireAgentChatChannelGrantLocksForThreadWriteOrThrow({
      manager: { query },
      workspaceId: WORKSPACE_ID,
      channelIds: [null, undefined],
    });

    expect(query).not.toHaveBeenCalled();
  });

  it('refuses with CHAT_CHANNEL_BUSY when the wait times out', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(buildQueryFailedError('55P03'));

    await expect(
      acquireAgentChatChannelGrantLocksForThreadWriteOrThrow({
        manager: { query },
        workspaceId: WORKSPACE_ID,
        channelIds: [FIRST_CHANNEL_ID],
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
      acquireAgentChatChannelGrantLocksForThreadWriteOrThrow({
        manager: { query },
        workspaceId: WORKSPACE_ID,
        channelIds: [FIRST_CHANNEL_ID],
      }),
    ).rejects.toBe(connectionError);
  });
});
