import { type FindOptionsOrderValue } from 'typeorm';

import { mapAgentHistoryOrderToWorkspace } from 'src/engine/metadata-modules/ai/ai-history/utils/map-agent-history-order-to-workspace.util';

describe('mapAgentHistoryOrderToWorkspace', () => {
  it.each<{ value: FindOptionsOrderValue; expected: 'ASC' | 'DESC' }>([
    { value: 'ASC', expected: 'ASC' },
    { value: 'asc', expected: 'ASC' },
    { value: 1, expected: 'ASC' },
    { value: 'DESC', expected: 'DESC' },
    { value: 'desc', expected: 'DESC' },
    { value: -1, expected: 'DESC' },
    { value: {}, expected: 'ASC' },
  ])('accepts TypeORM direction $value', ({ value, expected }) => {
    expect(
      mapAgentHistoryOrderToWorkspace('agentMessage', { createdAt: value }),
    ).toEqual({ createdAt: { order: expected } });
  });

  it.each(['first', 'FIRST', 'last', 'LAST'] as const)(
    'maps null placement %s',
    (nulls) => {
      expect(
        mapAgentHistoryOrderToWorkspace('agentMessage', {
          processedAt: { direction: 'desc', nulls },
        }),
      ).toEqual({
        processedAt: {
          order: 'DESC',
          nulls: nulls.toUpperCase() === 'FIRST' ? 'NULLS FIRST' : 'NULLS LAST',
        },
      });
    },
  );

  it('preserves relation order and maps thread archives without mutating the input', () => {
    const order = {
      deletedAt: { direction: 'DESC', nulls: 'LAST' },
      messages: { createdAt: 1 },
    } as const;
    expect(mapAgentHistoryOrderToWorkspace('agentChatThread', order)).toEqual({
      archivedAt: { order: 'DESC', nulls: 'NULLS LAST' },
      messages: { createdAt: { order: 'ASC' } },
    });
    expect(order.deletedAt).toEqual({ direction: 'DESC', nulls: 'LAST' });
    expect(
      mapAgentHistoryOrderToWorkspace('agentMessage', { deletedAt: 'ASC' }),
    ).toEqual({ deletedAt: { order: 'ASC' } });
  });

  it('leaves absent ordering unset and omits undefined fields', () => {
    expect(
      mapAgentHistoryOrderToWorkspace('agentMessage', undefined),
    ).toBeUndefined();
    expect(
      mapAgentHistoryOrderToWorkspace('agentMessage', { createdAt: undefined }),
    ).toEqual({});
  });

  it('rejects deeper relation ordering before generating a query', () => {
    expect(() =>
      mapAgentHistoryOrderToWorkspace('agentChatThread', {
        messages: { parts: { createdAt: 'ASC' } },
      }),
    ).toThrow('Nested history relation ordering is not supported');
  });

  it.each([
    ['{"createdAt":"sideways"}', 'Invalid history sort direction'],
    [
      '{"processedAt":{"direction":"DESC; SELECT 1"}}',
      'Invalid history sort direction',
    ],
    [
      '{"processedAt":{"nulls":"LAST; SELECT 1"}}',
      'Invalid history null ordering',
    ],
  ])('rejects malformed runtime sort options %s', (json, message) => {
    expect(() =>
      mapAgentHistoryOrderToWorkspace('agentMessage', JSON.parse(json)),
    ).toThrow(message);
  });
});
