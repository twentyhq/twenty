import { mapAgentHistorySelectToWorkspace } from 'src/engine/metadata-modules/ai/ai-history/utils/agent-history-workspace-mapping.util';

describe('mapAgentHistorySelectToWorkspace', () => {
  it('leaves an absent selection unset', () => {
    expect(
      mapAgentHistorySelectToWorkspace('agentChatThread', undefined),
    ).toBeUndefined();
  });

  it('maps the archive field in array projections without mutating the input', () => {
    const select = ['id', 'deletedAt'];
    expect(mapAgentHistorySelectToWorkspace('agentChatThread', select)).toEqual(
      ['id', 'archivedAt'],
    );
    expect(select).toEqual(['id', 'deletedAt']);
  });

  it('preserves included and excluded fields in object projections', () => {
    expect(
      mapAgentHistorySelectToWorkspace('agentChatThread', {
        id: true,
        deletedAt: true,
        title: false,
        activeStreamId: undefined,
      }),
    ).toEqual({
      id: true,
      archivedAt: true,
      title: false,
      activeStreamId: false,
    });
    expect(
      mapAgentHistorySelectToWorkspace('agentMessage', { deletedAt: true }),
    ).toEqual({ deletedAt: true });
  });

  it.each([
    '{"id":1}',
    '{"title":"true"}',
    '{"parts":{"id":true}}',
    '{"id":null}',
  ])('rejects a non-boolean runtime projection %s', (json) => {
    expect(() =>
      mapAgentHistorySelectToWorkspace('agentChatThread', JSON.parse(json)),
    ).toThrow('History field selections must be boolean');
  });
});
