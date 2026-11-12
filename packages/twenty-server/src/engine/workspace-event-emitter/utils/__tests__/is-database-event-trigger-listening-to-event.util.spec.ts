import { isDatabaseEventTriggerListeningToEvent } from 'src/engine/workspace-event-emitter/utils/is-database-event-trigger-listening-to-event.util';

describe('isDatabaseEventTriggerListeningToEvent', () => {
  it.each([
    ['person.created', true],
    ['*.created', true],
    ['person.*', true],
    ['*.*', true],
    ['person.updated', false],
    ['company.created', false],
  ])(
    'should say whether %s listens to person.created',
    (triggerEventName, expected) => {
      expect(
        isDatabaseEventTriggerListeningToEvent({
          triggerEventName,
          eventName: 'person.created',
        }),
      ).toBe(expected);
    },
  );
});
