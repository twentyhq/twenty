import { ValidateBy, type ValidationOptions } from 'class-validator';

import { isDatabaseEventTriggerSettingsInput } from 'src/engine/metadata-modules/logic-function/utils/is-database-event-trigger-settings-input.util';

export const IsDatabaseEventTriggerSettingsInput = (
  validationOptions?: ValidationOptions,
) =>
  ValidateBy(
    {
      name: 'isDatabaseEventTriggerSettingsInput',
      validator: {
        validate: isDatabaseEventTriggerSettingsInput,
        defaultMessage: () =>
          'databaseEventTriggerSettings must be a trigger object or an array of trigger objects',
      },
    },
    validationOptions,
  );
