import { WorkspaceCacheInFlightRecomputes } from 'src/engine/workspace-cache/services/workspace-cache-in-flight-recomputes';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const OTHER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

describe('WorkspaceCacheInFlightRecomputes', () => {
  it('marks only the flushed keys of in-flight recomputes in the flushed workspace as superseded', () => {
    const inFlightRecomputes = new WorkspaceCacheInFlightRecomputes();
    const recompute = inFlightRecomputes.start(WORKSPACE_ID, [
      'flatWorkflowMaps',
      'workflowAutomatedTriggerMaps',
    ]);
    const otherWorkspaceRecompute = inFlightRecomputes.start(
      OTHER_WORKSPACE_ID,
      ['workflowAutomatedTriggerMaps'],
    );

    inFlightRecomputes.supersede(WORKSPACE_ID, [
      'workflowAutomatedTriggerMaps',
      'billingEntitlements',
    ]);

    expect(
      inFlightRecomputes.isSuperseded(
        recompute,
        'workflowAutomatedTriggerMaps',
      ),
    ).toBe(true);
    expect(inFlightRecomputes.isSuperseded(recompute, 'flatWorkflowMaps')).toBe(
      false,
    );
    expect(
      inFlightRecomputes.isSuperseded(
        otherWorkspaceRecompute,
        'workflowAutomatedTriggerMaps',
      ),
    ).toBe(false);
  });

  it('does not supersede a recompute that starts after the flush', () => {
    const inFlightRecomputes = new WorkspaceCacheInFlightRecomputes();

    inFlightRecomputes.supersede(WORKSPACE_ID, [
      'workflowAutomatedTriggerMaps',
    ]);
    const recompute = inFlightRecomputes.start(WORKSPACE_ID, [
      'workflowAutomatedTriggerMaps',
    ]);

    expect(
      inFlightRecomputes.isSuperseded(
        recompute,
        'workflowAutomatedTriggerMaps',
      ),
    ).toBe(false);
  });

  it('stops tracking a recompute once it finishes', () => {
    const inFlightRecomputes = new WorkspaceCacheInFlightRecomputes();
    const finishedRecompute = inFlightRecomputes.start(WORKSPACE_ID, [
      'workflowAutomatedTriggerMaps',
    ]);
    const runningRecompute = inFlightRecomputes.start(WORKSPACE_ID, [
      'workflowAutomatedTriggerMaps',
    ]);

    inFlightRecomputes.finish(finishedRecompute);
    inFlightRecomputes.supersede(WORKSPACE_ID, [
      'workflowAutomatedTriggerMaps',
    ]);

    expect(
      inFlightRecomputes.isSuperseded(
        finishedRecompute,
        'workflowAutomatedTriggerMaps',
      ),
    ).toBe(false);
    expect(
      inFlightRecomputes.isSuperseded(
        runningRecompute,
        'workflowAutomatedTriggerMaps',
      ),
    ).toBe(true);
  });
});
