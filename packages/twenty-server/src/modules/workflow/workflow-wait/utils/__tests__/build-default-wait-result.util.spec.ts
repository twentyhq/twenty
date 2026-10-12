import { buildDefaultWaitResult } from 'src/modules/workflow/workflow-wait/utils/build-default-wait-result.util';

const EVENT = {
  eventName: 'company.updated',
  recordId: 'company-id',
  record: { id: 'company-id', name: 'Acme' },
};

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
