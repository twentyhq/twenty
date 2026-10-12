import { getWorkflowVersionUniversalIdentifier } from '@/application/deterministic-identifier/get-workflow-version-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getWorkflowVersionUniversalIdentifier', () => {
  it('derives a deterministic id from the workflow within its application', () => {
    expect(
      getWorkflowVersionUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        workflowUniversalIdentifier: '22222222-2222-4222-8222-222222222222',
      }),
    ).toBe('3cafec04-e2a4-54cd-8775-601e84c13ceb');
  });

  it('gives each workflow its own version identifier', () => {
    expect(
      getWorkflowVersionUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        workflowUniversalIdentifier: '33333333-3333-4333-8333-333333333333',
      }),
    ).toBe('918dd6c5-f3a0-5dd8-9944-7b70ed903d87');
  });
});
