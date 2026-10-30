import { parseSetuAiActionProjection } from '@/ai/utils/parse-setu-ai-action-projection.util';

const projection = {
  schemaVersion: 1,
  id: 'action-id',
  logicalActionId: 'logical-id',
  revision: 1,
  stateVersion: 1,
  status: 'pending_review',
  allowedOperations: ['revise', 'approve', 'reject'],
  kind: 'send_email',
  payload: { subject: 'Hi' },
};

describe('parseSetuAiActionProjection', () => {
  it('accepts a known projection', () => {
    expect(parseSetuAiActionProjection(projection).status).toBe('valid');
  });

  it('flags a newer schema version', () => {
    expect(
      parseSetuAiActionProjection({ ...projection, schemaVersion: 2 }),
    ).toEqual({ status: 'unsupported-version' });
  });

  it('refuses unknown statuses and operations', () => {
    expect(
      parseSetuAiActionProjection({ ...projection, status: 'teleported' })
        .status,
    ).toBe('invalid');
    expect(
      parseSetuAiActionProjection({
        ...projection,
        allowedOperations: ['approve', 'delete_everything'],
      }).status,
    ).toBe('invalid');
  });
});
