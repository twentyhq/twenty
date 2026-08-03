import { type ConfigVariableValue } from 'twenty-shared/types';

import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { getConfigVariable } from 'test/integration/twenty-config/utils/get-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

// Registers beforeAll/afterAll hooks that apply a database config override for
// the suite and restore the previous state afterwards, rather than blindly
// deleting: a suite must not erase an override another suite (or the
// environment) had in place.
export const setupDatabaseConfigOverrideForSuite = (
  key: string,
  value: ConfigVariableValue,
): void => {
  let previousOverrideValue: ConfigVariableValue;
  let hadPreviousOverride = false;

  beforeAll(async () => {
    const { data } = await getConfigVariable({ input: { key } });

    hadPreviousOverride = data.getDatabaseConfigVariable.source === 'DATABASE';

    if (hadPreviousOverride) {
      previousOverrideValue = data.getDatabaseConfigVariable.value;
      await updateConfigVariable({ input: { key, value } });
    } else {
      await createConfigVariable({ input: { key, value } });
    }
  });

  afterAll(async () => {
    if (hadPreviousOverride) {
      await updateConfigVariable({
        input: { key, value: previousOverrideValue },
      }).catch(() => {});
    } else {
      await deleteConfigVariable({ input: { key } }).catch(() => {});
    }
  });
};
