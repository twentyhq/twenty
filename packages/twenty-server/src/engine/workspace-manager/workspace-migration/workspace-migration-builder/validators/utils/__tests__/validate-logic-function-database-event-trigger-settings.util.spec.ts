import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';

import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { validateLogicFunctionDatabaseEventTriggerSettings } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-logic-function-database-event-trigger-settings.util';

const asTriggerSettings = (value: unknown) =>
  value as DatabaseEventTriggerSettings[];

describe('validateLogicFunctionDatabaseEventTriggerSettings', () => {
  it('should return no error when no database event trigger is set', () => {
    expect(validateLogicFunctionDatabaseEventTriggerSettings({})).toEqual([]);
    expect(
      validateLogicFunctionDatabaseEventTriggerSettings({
        databaseEventTriggerSettings: null,
      }),
    ).toEqual([]);
  });

  it('should return no error for a list of triggers with event names', () => {
    expect(
      validateLogicFunctionDatabaseEventTriggerSettings({
        databaseEventTriggerSettings: [
          { eventName: 'person.created' },
          { eventName: '*.updated', updatedFields: ['city'], batchMode: true },
        ],
      }),
    ).toEqual([]);
  });

  it('should return an error when the settings are a single trigger object', () => {
    const errors = validateLogicFunctionDatabaseEventTriggerSettings({
      databaseEventTriggerSettings: asTriggerSettings({
        eventName: 'person.created',
      }),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
    );
  });

  it('should return an error when a trigger has no event name', () => {
    const errors = validateLogicFunctionDatabaseEventTriggerSettings({
      databaseEventTriggerSettings: asTriggerSettings([
        { eventName: 'person.created' },
        { eventName: '' },
      ]),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
    );
  });

  it('should return an error when updatedFields is not a list of field names', () => {
    const errors = validateLogicFunctionDatabaseEventTriggerSettings({
      databaseEventTriggerSettings: asTriggerSettings([
        { eventName: 'person.updated', updatedFields: 1 },
      ]),
    });

    expect(errors).toHaveLength(1);
  });

  it('should return an error when batchMode is not a boolean', () => {
    const errors = validateLogicFunctionDatabaseEventTriggerSettings({
      databaseEventTriggerSettings: asTriggerSettings([
        { eventName: 'person.updated', batchMode: 'yes' },
      ]),
    });

    expect(errors).toHaveLength(1);
  });

  it('should return an error when a trigger is not an object', () => {
    const errors = validateLogicFunctionDatabaseEventTriggerSettings({
      databaseEventTriggerSettings: asTriggerSettings(['person.created']),
    });

    expect(errors).toHaveLength(1);
  });
});
