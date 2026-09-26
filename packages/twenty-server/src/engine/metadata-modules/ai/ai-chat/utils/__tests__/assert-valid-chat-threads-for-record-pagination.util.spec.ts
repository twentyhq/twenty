import {
  assertValidChatThreadsForRecordPagination,
  MAX_CHAT_THREADS_FOR_RECORD_LIMIT,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/assert-valid-chat-threads-for-record-pagination.util';

const validate = (limit: number, offset: number) => () =>
  assertValidChatThreadsForRecordPagination({ limit, offset });

describe('assertValidChatThreadsForRecordPagination', () => {
  it.each([
    ['the smallest page', 1, 0],
    ['the largest page', MAX_CHAT_THREADS_FOR_RECORD_LIMIT, 0],
    ['a later page', 20, 40],
  ])('accepts %s', (_case, limit, offset) => {
    expect(validate(limit, offset)).not.toThrow();
  });

  it.each([
    ['a limit below one', 0],
    ['a negative limit', -1],
    ['a limit past the ceiling', MAX_CHAT_THREADS_FOR_RECORD_LIMIT + 1],
    ['a fractional limit', 1.5],
    ['a non-finite limit', Number.NaN],
  ])('rejects %s', (_case, limit) => {
    expect(validate(limit, 0)).toThrow(/limit must be an integer between/);
  });

  it.each([
    ['a negative offset', -1],
    ['a fractional offset', 0.5],
    ['a non-finite offset', Number.POSITIVE_INFINITY],
  ])('rejects %s', (_case, offset) => {
    expect(validate(20, offset)).toThrow(/offset must be a non-negative/);
  });

  // The bounds are what stops a caller asking the ranked query for an
  // unbounded page, so they fail loudly rather than being clamped.
  it('reports an out-of-range limit as invalid input', () => {
    expect(validate(MAX_CHAT_THREADS_FOR_RECORD_LIMIT + 1, 0)).toThrow(
      expect.objectContaining({ code: 'INVALID_AGENT_INPUT' }),
    );
  });
});
