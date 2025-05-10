import { createConfigVariable } from './utils/create-config-variable.util';
import { deleteConfigVariable } from './utils/delete-config-variable.util';
import { getConfigVariable } from './utils/get-config-variable.util';
import { getConfigVariablesGrouped } from './utils/get-config-variables-grouped.util';
import { makeUnauthenticatedAPIRequest } from './utils/make-unauthenticated-api-request.util';
import { updateConfigVariable } from './utils/update-config-variable.util';

// what if any of these keys are removed from the config?
// TODO: move to a constants file
const TEST_KEY_DEFAULT = 'IS_ATTACHMENT_PREVIEW_ENABLED';
const TEST_KEY_NOTIFICATION = 'WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION';
const TEST_KEY_SOFT_DELETION = 'WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION';
const TEST_KEY_DELETION = 'WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION';
const TEST_KEY_METRICS = 'HEALTH_METRICS_TIME_WINDOW_IN_MINUTES';
const TEST_KEY_ENV_ONLY = 'PG_DATABASE_URL';
const TEST_KEY_NONEXISTENT = 'NONEXISTENT_CONFIG_KEY';

// Error messages constants
// I am aware that this is probably not the best way to do this, but it's the best I can think of for now
// will clean up later
// TODO: check how its done in other places and follow that pattern
const ENV_ONLY_ERROR_MESSAGE = `Cannot create environment-only variable: ${TEST_KEY_ENV_ONLY}`;
const VARIABLE_NOT_FOUND_ERROR_MESSAGE = `Config variable "${TEST_KEY_NONEXISTENT}" does not exist in ConfigVariables`;
const GRAPHQL_ERROR_MESSAGE =
  'Cannot query field "key" on type "ConfigVariable"';

describe('TwentyConfig Integration', () => {
  // still debating if we should do this or always infer it from the env
  beforeAll(() => {
    process.env.IS_CONFIG_VARIABLES_IN_DB_ENABLED = 'true';
  });

  afterAll(async () => {
    await deleteConfigVariable({
      input: { key: TEST_KEY_NOTIFICATION },
    }).catch(() => {});
    await deleteConfigVariable({
      input: { key: TEST_KEY_SOFT_DELETION },
    }).catch(() => {});
    await deleteConfigVariable({
      input: { key: TEST_KEY_DELETION },
    }).catch(() => {});
    await deleteConfigVariable({
      input: { key: TEST_KEY_METRICS },
    }).catch(() => {});
  });

  it('should get config variable with DEFAULT source when not overridden', async () => {
    const result = await getConfigVariable({
      input: {
        key: TEST_KEY_DEFAULT,
      },
    });

    expect(result.data.getDatabaseConfigVariable).toBeDefined();
    expect(result.data.getDatabaseConfigVariable.source).toBe('DEFAULT');
  });

  it('should show DATABASE source when overridden and DEFAULT after deletion', async () => {
    const defaultResult = await getConfigVariable({
      input: {
        key: TEST_KEY_NOTIFICATION,
      },
    });

    expect(defaultResult.data.getDatabaseConfigVariable.source).toBe('DEFAULT');

    const overrideValue = 999;

    await createConfigVariable({
      input: {
        key: TEST_KEY_NOTIFICATION,
        value: overrideValue,
      },
    });

    const overrideResult = await getConfigVariable({
      input: {
        key: TEST_KEY_NOTIFICATION,
      },
    });

    expect(overrideResult.data.getDatabaseConfigVariable.source).toBe(
      'DATABASE',
    );
    expect(overrideResult.data.getDatabaseConfigVariable.value).toBe(
      overrideValue,
    );

    const newOverrideValue = 888;

    await updateConfigVariable({
      input: {
        key: TEST_KEY_NOTIFICATION,
        value: newOverrideValue,
      },
    });

    const updatedResult = await getConfigVariable({
      input: {
        key: TEST_KEY_NOTIFICATION,
      },
    });

    expect(updatedResult.data.getDatabaseConfigVariable.source).toBe(
      'DATABASE',
    );
    expect(updatedResult.data.getDatabaseConfigVariable.value).toBe(
      newOverrideValue,
    );

    await deleteConfigVariable({
      input: {
        key: TEST_KEY_NOTIFICATION,
      },
    });

    const afterDeleteResult = await getConfigVariable({
      input: {
        key: TEST_KEY_NOTIFICATION,
      },
    });

    expect(afterDeleteResult.data.getDatabaseConfigVariable.source).toBe(
      'DEFAULT',
    );
  });

  it('should be able to create and retrieve config variables', async () => {
    const testKey = TEST_KEY_SOFT_DELETION;
    const testValue = 777;

    const createResult = await createConfigVariable({
      input: {
        key: testKey,
        value: testValue,
      },
    });

    expect(createResult.data.createDatabaseConfigVariable).toBe(true);

    const getResult = await getConfigVariable({
      input: {
        key: testKey,
      },
    });

    expect(getResult.data.getDatabaseConfigVariable.value).toBe(testValue);
    expect(getResult.data.getDatabaseConfigVariable.source).toBe('DATABASE');

    await deleteConfigVariable({
      input: {
        key: testKey,
      },
    });
  });

  it('should be able to update existing config variables', async () => {
    const testKey = TEST_KEY_DELETION;
    const initialValue = 555;
    const updatedValue = 666;

    await createConfigVariable({
      input: {
        key: testKey,
        value: initialValue,
      },
    });

    const initialResult = await getConfigVariable({
      input: {
        key: testKey,
      },
    });

    expect(initialResult.data.getDatabaseConfigVariable.source).toBe(
      'DATABASE',
    );
    expect(initialResult.data.getDatabaseConfigVariable.value).toBe(
      initialValue,
    );

    const updateResult = await updateConfigVariable({
      input: {
        key: testKey,
        value: updatedValue,
      },
    });

    expect(updateResult.data.updateDatabaseConfigVariable).toBe(true);

    const getResult = await getConfigVariable({
      input: {
        key: testKey,
      },
    });

    expect(getResult.data.getDatabaseConfigVariable.source).toBe('DATABASE');
    expect(getResult.data.getDatabaseConfigVariable.value).toBe(updatedValue);

    await deleteConfigVariable({
      input: {
        key: testKey,
      },
    });
  });

  it('should return to DEFAULT source after deleting a variable', async () => {
    const testKey = TEST_KEY_DELETION;
    const testValue = 333;

    await createConfigVariable({
      input: {
        key: testKey,
        value: testValue,
      },
    });

    const beforeDelete = await getConfigVariable({
      input: {
        key: testKey,
      },
    });

    expect(beforeDelete.data.getDatabaseConfigVariable).toBeDefined();
    expect(beforeDelete.data.getDatabaseConfigVariable.source).toBe('DATABASE');
    expect(beforeDelete.data.getDatabaseConfigVariable.value).toBe(testValue);

    const deleteResult = await deleteConfigVariable({
      input: {
        key: testKey,
      },
    });

    expect(deleteResult.data.deleteDatabaseConfigVariable).toBe(true);

    const afterDelete = await getConfigVariable({
      input: {
        key: testKey,
      },
    });

    expect(afterDelete.data.getDatabaseConfigVariable).toBeDefined();
    expect(afterDelete.data.getDatabaseConfigVariable.source).toBe('DEFAULT');
  });

  it('should be able to get all config variables grouped', async () => {
    const testKey = TEST_KEY_METRICS;
    const testValue = 444;

    await createConfigVariable({
      input: {
        key: testKey,
        value: testValue,
      },
    });

    const result = await getConfigVariablesGrouped();

    expect(result.data.getConfigVariablesGrouped).toBeDefined();
    expect(result.data.getConfigVariablesGrouped.groups).toBeInstanceOf(Array);

    const allVariables = result.data.getConfigVariablesGrouped.groups.flatMap(
      (group) => group.variables,
    );
    const testVariable = allVariables.find(
      (variable) => variable.name === testKey,
    );

    expect(testVariable).toBeDefined();
    expect(testVariable.value).toBe(testValue);
    expect(testVariable.source).toBe('DATABASE');

    await deleteConfigVariable({
      input: {
        key: testKey,
      },
    });
  });

  it('should reject modifications to environment-only variables', async () => {
    const result = await createConfigVariable({
      input: {
        key: TEST_KEY_ENV_ONLY,
        value: 'postgres://test:test@localhost:5432/test',
      },
      expectToFail: true,
    });

    expect(result.errors).toBeDefined();
    expect(result.errors[0].message).toContain(ENV_ONLY_ERROR_MESSAGE);
  });

  it('should reject operations on non-existent config variables', async () => {
    const result = await getConfigVariable({
      input: {
        key: TEST_KEY_NONEXISTENT,
      },
      expectToFail: true,
    });

    expect(result.errors).toBeDefined();
    expect(result.errors[0].message).toContain(
      VARIABLE_NOT_FOUND_ERROR_MESSAGE,
    );
  });

  it('should reject config operations from non-admin users', async () => {
    const graphqlQuery = `
      query GetDatabaseConfigVariable {
        getDatabaseConfigVariable(key: "${TEST_KEY_DEFAULT}") {
          key
          value
          source
        }
      }
    `;

    const response = await makeUnauthenticatedAPIRequest(graphqlQuery);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(GRAPHQL_ERROR_MESSAGE);
  });

  it('should handle large string config values', async () => {
    const testKey = TEST_KEY_METRICS;
    const largeValue = 9999;

    await createConfigVariable({
      input: {
        key: testKey,
        value: largeValue,
      },
    });

    const getResult = await getConfigVariable({
      input: {
        key: testKey,
      },
    });

    expect(getResult.data.getDatabaseConfigVariable.value).toBe(largeValue);

    await deleteConfigVariable({
      input: {
        key: testKey,
      },
    });
  });
});
