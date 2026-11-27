import { buildInboxMessageToolCallId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-tool-call-id.util';

const MESSAGE_ID = '6f1d7c2a-3b4e-4f5a-8b9c-0d1e2f3a4b5c';

const buildIds = (messageId: string) =>
  Array.from({ length: 10 }, (_, position) =>
    buildInboxMessageToolCallId({ messageId, position }),
  );

describe('buildInboxMessageToolCallId', () => {
  it('names the first call after the message, as when a message held a single call', () => {
    expect(
      buildInboxMessageToolCallId({ messageId: MESSAGE_ID, position: 0 }),
    ).toBe('call_6f1d7c2a3b4e4f5a8b9c0d1e2f3a4b5c');
  });

  it('returns the same ids for the same message', () => {
    expect(buildIds(MESSAGE_ID)).toEqual(buildIds(MESSAGE_ID));
  });

  it('returns a distinct id for each position, all shaped like the first', () => {
    const ids = buildIds(MESSAGE_ID);

    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^call_[0-9a-f]{32}$/));
  });

  it('returns other ids for another message', () => {
    const otherIds = buildIds('0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d');

    expect(buildIds(MESSAGE_ID).some((id) => otherIds.includes(id))).toBe(
      false,
    );
  });
});
