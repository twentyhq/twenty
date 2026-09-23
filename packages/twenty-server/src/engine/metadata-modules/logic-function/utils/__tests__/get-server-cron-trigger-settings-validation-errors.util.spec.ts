import {
  getServerCronTriggerSettingsValidationErrors,
  type LogicFunctionTriggerSettings,
} from 'src/engine/metadata-modules/logic-function/utils/get-server-cron-trigger-settings-validation-errors.util';

const NO_TRIGGER_SETTINGS: LogicFunctionTriggerSettings = {
  cronTriggerSettings: null,
  databaseEventTriggerSettings: null,
  httpRouteTriggerSettings: null,
  serverRouteTriggerSettings: null,
  serverCronTriggerSettings: null,
  toolTriggerSettings: null,
  workflowActionTriggerSettings: null,
};

describe('getServerCronTriggerSettingsValidationErrors', () => {
  it('returns no error without server cron trigger', () => {
    expect(
      getServerCronTriggerSettingsValidationErrors({
        ...NO_TRIGGER_SETTINGS,
        cronTriggerSettings: { pattern: 'not a cron' },
      }),
    ).toEqual([]);
  });

  it('returns no error for a valid 5 field pattern', () => {
    expect(
      getServerCronTriggerSettingsValidationErrors({
        ...NO_TRIGGER_SETTINGS,
        serverCronTriggerSettings: { pattern: '30 4 * * *' },
      }),
    ).toEqual([]);
  });

  it.each(['0 30 4 * * *', '30 4 * *', '@daily', '99 4 * * *', ''])(
    'rejects the pattern "%s"',
    (pattern) => {
      const errors = getServerCronTriggerSettingsValidationErrors({
        ...NO_TRIGGER_SETTINGS,
        serverCronTriggerSettings: { pattern },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].value).toBe(pattern);
    },
  );

  it('rejects a server cron combined with another trigger', () => {
    const errors = getServerCronTriggerSettingsValidationErrors({
      ...NO_TRIGGER_SETTINGS,
      serverCronTriggerSettings: { pattern: '30 4 * * *' },
      databaseEventTriggerSettings: { eventName: 'callRecording.updated' },
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      'Server cron trigger cannot be combined with another trigger',
    );
  });
});
