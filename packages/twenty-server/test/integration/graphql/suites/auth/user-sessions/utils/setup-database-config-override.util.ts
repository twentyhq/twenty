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
    try {
      if (hadPreviousOverride) {
        await updateConfigVariable({
          input: { key, value: previousOverrideValue },
        });
      } else {
        await deleteConfigVariable({ input: { key } });
      }
    } catch (error) {
      // Reported rather than rethrown: a passing suite should not go red over
      // its own teardown. But a swallowed failure leaves the override in place
      // and the next suite fails for reasons that point nowhere near here, so
      // it has to be visible.
      process.stderr.write(
        `[config-override] failed to restore ${key}, later suites may see a stale value: ${
          error instanceof Error ? error.message : String(error)
        }\n`,
      );
    }
  });
};
