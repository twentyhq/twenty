import { buildDefaultWaitResult } from 'src/modules/workflow/workflow-wait/utils/build-default-wait-result.util';
import { buildWaitOutcome } from 'src/modules/workflow/workflow-wait/utils/build-wait-outcome.util';

const EVENT = {
  eventName: 'company.updated',
  recordId: 'company-id',
  record: { id: 'company-id', name: 'Acme' },
};

describe('buildWaitOutcome', () => {
  it('reports an event when one resolved the wait', () => {
    expect(
      buildWaitOutcome({
        wait: { type: 'EVENT', eventName: 'company.updated' },
        event: EVENT,
      }),
    ).toEqual({ type: 'EVENT_RECEIVED', event: EVENT });
  });

  it('reports elapsed time for a time wait', () => {
    expect(
      buildWaitOutcome({
        wait: { type: 'TIME', resumeAt: new Date().toISOString() },
      }),
    ).toEqual({ type: 'TIME_ELAPSED' });
  });

  it('reports an expiry for an event wait whose time came', () => {
    expect(
      buildWaitOutcome({
        wait: { type: 'EVENT', eventName: 'company.updated' },
      }),
    ).toEqual({ type: 'EXPIRED' });
  });
});

describe('buildDefaultWaitResult', () => {
  it('keeps the delay result for elapsed time', () => {
    expect(buildDefaultWaitResult({ type: 'TIME_ELAPSED' })).toEqual({
      success: true,
    });
  });

  it('exposes the event and that it did not time out', () => {
    expect(
      buildDefaultWaitResult({ type: 'EVENT_RECEIVED', event: EVENT }),
    ).toEqual({ hasTimedOut: false, ...EVENT });
  });

  it('reports a timeout when the wait expired', () => {
    expect(buildDefaultWaitResult({ type: 'EXPIRED' })).toEqual({
      hasTimedOut: true,
    });
  });
});
