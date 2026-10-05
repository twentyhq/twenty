import { normalizeDatabaseEventTriggerSettings } from 'src/engine/metadata-modules/logic-function/utils/normalize-database-event-trigger-settings.util';

describe('normalizeDatabaseEventTriggerSettings', () => {
  it('returns null when no database event trigger is set', () => {
    expect(normalizeDatabaseEventTriggerSettings(undefined)).toBeNull();
    expect(normalizeDatabaseEventTriggerSettings(null)).toBeNull();
  });

  it('keeps a list of triggers as is', () => {
    const triggers = [
      { eventName: 'person.created' },
      { eventName: 'person.updated', updatedFields: ['city'] },
    ];

    expect(normalizeDatabaseEventTriggerSettings(triggers)).toBe(triggers);
  });

  it('wraps a single trigger object into a list', () => {
    expect(
      normalizeDatabaseEventTriggerSettings({
        eventName: 'person.created',
        batchMode: true,
      }),
    ).toEqual([{ eventName: 'person.created', batchMode: true }]);
  });
});
