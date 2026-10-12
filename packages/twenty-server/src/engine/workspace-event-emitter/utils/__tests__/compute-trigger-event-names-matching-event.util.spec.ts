import { computeTriggerEventNamesMatchingEvent } from 'src/engine/workspace-event-emitter/utils/compute-trigger-event-names-matching-event.util';

describe('computeTriggerEventNamesMatchingEvent', () => {
  it('should return the exact event name and its wildcards', () => {
    expect(computeTriggerEventNamesMatchingEvent('company.created')).toEqual([
      'company.created',
      '*.created',
      'company.*',
      '*.*',
    ]);
  });
});
