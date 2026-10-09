import { getWorkflowCommandMenuItemUniversalIdentifier } from '@/application/deterministic-identifier/get-workflow-command-menu-item-universal-identifier.util';
import { getWorkflowVersionUniversalIdentifier } from '@/application/deterministic-identifier/get-workflow-version-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const WORKFLOW = '22222222-2222-4222-8222-222222222222';

describe('getWorkflowCommandMenuItemUniversalIdentifier', () => {
  it('derives a deterministic id from the workflow within its application', () => {
    const identifier = getWorkflowCommandMenuItemUniversalIdentifier({
      applicationUniversalIdentifier: APP,
      workflowUniversalIdentifier: WORKFLOW,
    });

    expect(identifier).toBe(
      getWorkflowCommandMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        workflowUniversalIdentifier: WORKFLOW,
      }),
    );
    expect(identifier).not.toBe(
      getWorkflowVersionUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        workflowUniversalIdentifier: WORKFLOW,
      }),
    );
  });

  it('gives each workflow its own command menu item identifier', () => {
    expect(
      getWorkflowCommandMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        workflowUniversalIdentifier: WORKFLOW,
      }),
    ).not.toBe(
      getWorkflowCommandMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        workflowUniversalIdentifier: '33333333-3333-4333-8333-333333333333',
      }),
    );
  });
});
