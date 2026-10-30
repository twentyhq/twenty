import { parseSetuAiTaskProjection } from '@/ai/utils/parse-setu-ai-task-projection.util';

const step = {
  id: 'step-id',
  stepKey: 'company:1',
  position: 0,
  companyId: 'company-id',
  companyName: 'Acme',
  status: 'waiting_input',
  stateVersion: 2,
  errorCode: null,
  allowedOperations: ['answer'],
  pendingInput: { version: 1, prompt: 'Which website?', fields: [] },
  brief: null,
  completedAt: null,
};

const projection = {
  schemaVersion: 1,
  id: 'task-id',
  kind: 'account_research',
  status: 'waiting_input',
  stateVersion: 3,
  focus: null,
  saveBriefsAsNotes: false,
  allowedOperations: ['cancel'],
  errorCode: null,
  usage: { totalTokens: 10, tokenLimit: 100 },
  steps: [step],
};

describe('parseSetuAiTaskProjection', () => {
  it('accepts a known projection', () => {
    expect(parseSetuAiTaskProjection(projection).status).toBe('valid');
  });

  it('flags a newer schema version', () => {
    expect(
      parseSetuAiTaskProjection({ ...projection, schemaVersion: 2 }),
    ).toEqual({ status: 'unsupported-version' });
  });

  it('refuses unknown task or step operations', () => {
    expect(
      parseSetuAiTaskProjection({
        ...projection,
        allowedOperations: ['delete_everything'],
      }).status,
    ).toBe('invalid');
    expect(
      parseSetuAiTaskProjection({
        ...projection,
        steps: [{ ...step, allowedOperations: ['approve'] }],
      }).status,
    ).toBe('invalid');
  });

  it('refuses an unknown step status', () => {
    expect(
      parseSetuAiTaskProjection({
        ...projection,
        steps: [{ ...step, status: 'teleported' }],
      }).status,
    ).toBe('invalid');
  });
});
