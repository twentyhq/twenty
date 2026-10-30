import { parseSetuInteractionResult } from '@/ai/utils/parse-setu-interaction-result.util';

describe('parseSetuInteractionResult', () => {
  it('parses an action review reference', () => {
    expect(
      parseSetuInteractionResult({
        interaction: {
          schemaVersion: 1,
          kind: 'action-review',
          actionRequestId: 'action-id',
        },
      }),
    ).toEqual({
      status: 'valid',
      interaction: {
        schemaVersion: 1,
        kind: 'action-review',
        actionRequestId: 'action-id',
      },
    });
  });

  it('flags a newer schema version', () => {
    expect(
      parseSetuInteractionResult({
        interaction: { schemaVersion: 2, kind: 'action-review' },
      }),
    ).toEqual({ status: 'unsupported-version' });
  });

  it('rejects extra properties and unknown kinds', () => {
    expect(
      parseSetuInteractionResult({
        interaction: {
          schemaVersion: 1,
          kind: 'task-status',
          taskId: 'task-id',
          status: 'completed',
        },
      }),
    ).toEqual({ status: 'invalid' });
    expect(
      parseSetuInteractionResult({
        interaction: { schemaVersion: 1, kind: 'html', html: '<b>x</b>' },
      }),
    ).toEqual({ status: 'invalid' });
  });
});
