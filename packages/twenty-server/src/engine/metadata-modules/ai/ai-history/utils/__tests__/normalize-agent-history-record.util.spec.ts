import { normalizeAgentHistoryRecord } from 'src/engine/metadata-modules/ai/ai-history/utils/normalize-agent-history-record.util';

describe('normalizeAgentHistoryRecord', () => {
  it.each([
    ['', null],
    [null, null],
    [undefined, undefined],
    ['active-stream-id', 'active-stream-id'],
  ])('normalizes the stream claim %p to %p', (activeStreamId, expected) => {
    const record = { activeStreamId, title: '' };
    expect(
      normalizeAgentHistoryRecord({
        record,
        workspaceId: 'workspace-id',
        objectName: 'agentChatThread',
      }),
    ).toMatchObject({ activeStreamId: expected, title: '' });
    expect(record.activeStreamId).toBe(activeStreamId);
  });

  it('preserves nested record deletion dates independently of the thread archive', () => {
    const archivedAt = '2026-09-10T10:00:00.000Z';
    const deletedAt = '2026-09-11T10:00:00.000Z';
    const normalized = normalizeAgentHistoryRecord({
      record: {
        archivedAt,
        deletedAt: null,
        messages: [
          {
            deletedAt,
            parts: [{ deletedAt }],
          },
        ],
        turns: [
          {
            deletedAt,
            totalInputCredits: '123',
            evaluations: [{ deletedAt }],
          },
        ],
      },
      workspaceId: 'workspace-id',
      objectName: 'agentChatThread',
    });

    expect(normalized).toMatchObject({
      workspaceId: 'workspace-id',
      deletedAt: new Date(archivedAt),
      messages: [
        {
          workspaceId: 'workspace-id',
          deletedAt: new Date(deletedAt),
          parts: [
            { workspaceId: 'workspace-id', deletedAt: new Date(deletedAt) },
          ],
        },
      ],
      turns: [
        {
          workspaceId: 'workspace-id',
          deletedAt: new Date(deletedAt),
          totalInputCredits: 123,
          evaluations: [
            { workspaceId: 'workspace-id', deletedAt: new Date(deletedAt) },
          ],
        },
      ],
    });
  });

  it('leaves tool payloads and the source record unchanged', () => {
    const toolOutput = {
      createdAt: '2026-09-10T10:00:00.000Z',
      totalInputCredits: '9007199254740993',
      messages: [{ deletedAt: '2026-09-11T10:00:00.000Z' }],
    };
    const record = { createdAt: toolOutput.createdAt, toolOutput };

    const normalized = normalizeAgentHistoryRecord({
      record,
      workspaceId: 'workspace-id',
      objectName: 'agentMessagePart',
    });

    expect(normalized.createdAt).toEqual(new Date(record.createdAt));
    expect(normalized.toolOutput).toEqual(toolOutput);
    expect(record).toEqual({ createdAt: toolOutput.createdAt, toolOutput });
  });
});
