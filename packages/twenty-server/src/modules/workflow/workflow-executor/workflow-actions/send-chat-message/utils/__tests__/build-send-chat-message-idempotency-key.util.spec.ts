import { buildSendChatMessageIdempotencyKey } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/utils/build-send-chat-message-idempotency-key.util';

const INPUT = {
  stepId: 'step-id',
  title: 'New deal',
  message: 'Acme signed.',
};

describe('buildSendChatMessageIdempotencyKey', () => {
  it('returns the same key when the step sends the same message again', () => {
    expect(buildSendChatMessageIdempotencyKey(INPUT)).toBe(
      buildSendChatMessageIdempotencyKey({ ...INPUT }),
    );
  });

  it.each([
    { stepId: 'other-step-id' },
    { title: 'Other deal' },
    { message: 'Globex signed.' },
  ])('returns another key when %o differs', (override) => {
    expect(
      buildSendChatMessageIdempotencyKey({ ...INPUT, ...override }),
    ).not.toBe(buildSendChatMessageIdempotencyKey(INPUT));
  });
});
