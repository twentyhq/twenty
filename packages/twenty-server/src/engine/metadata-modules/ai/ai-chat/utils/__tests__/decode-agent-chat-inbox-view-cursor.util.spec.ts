import { decodeAgentChatInboxViewCursor } from 'src/engine/metadata-modules/ai/ai-chat/utils/decode-agent-chat-inbox-view-cursor.util';
import { encodeAgentChatInboxViewCursor } from 'src/engine/metadata-modules/ai/ai-chat/utils/encode-agent-chat-inbox-view-cursor.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const THREAD_ID = '20202020-463f-435b-828c-107e007a2711';

describe('decodeAgentChatInboxViewCursor', () => {
  it.each([
    { lastActivityAt: '2026-10-06T21:33:04.123456Z', id: THREAD_ID },
    { lastActivityAt: null, id: THREAD_ID },
  ])('reads back the cursor it was given', (cursor) => {
    expect(
      decodeAgentChatInboxViewCursor(encodeAgentChatInboxViewCursor(cursor)),
    ).toEqual(cursor);
  });

  it.each([
    ['not base64 JSON', 'not-a-cursor'],
    [
      'a date without microseconds',
      Buffer.from(JSON.stringify(['2026-10-06T21:33:04Z', THREAD_ID])).toString(
        'base64url',
      ),
    ],
    [
      'an id that is not a uuid',
      Buffer.from(
        JSON.stringify(['2026-10-06T21:33:04.123456Z', 'thread']),
      ).toString('base64url'),
    ],
    [
      'an object',
      Buffer.from(JSON.stringify({ id: THREAD_ID })).toString('base64url'),
    ],
  ])('refuses %s', (_description, cursor) => {
    expect(() => decodeAgentChatInboxViewCursor(cursor)).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.INVALID_CHAT_INBOX_VIEW,
      }),
    );
  });
});
