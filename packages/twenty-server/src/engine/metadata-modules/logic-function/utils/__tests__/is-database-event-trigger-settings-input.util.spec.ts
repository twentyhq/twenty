import { isDatabaseEventTriggerSettingsInput } from 'src/engine/metadata-modules/logic-function/utils/is-database-event-trigger-settings-input.util';

describe('isDatabaseEventTriggerSettingsInput', () => {
  it('accepts a single trigger object', () => {
    expect(
      isDatabaseEventTriggerSettingsInput({ eventName: 'person.created' }),
    ).toBe(true);
  });

  it('accepts a list of trigger objects', () => {
    expect(
      isDatabaseEventTriggerSettingsInput([
        { eventName: 'person.created' },
        { eventName: 'person.updated' },
      ]),
    ).toBe(true);
    expect(isDatabaseEventTriggerSettingsInput([])).toBe(true);
  });

  it('rejects anything that is not an object or a list of objects', () => {
    expect(isDatabaseEventTriggerSettingsInput('person.created')).toBe(false);
    expect(isDatabaseEventTriggerSettingsInput(['person.created'])).toBe(false);
    expect(isDatabaseEventTriggerSettingsInput(null)).toBe(false);
  });
});
