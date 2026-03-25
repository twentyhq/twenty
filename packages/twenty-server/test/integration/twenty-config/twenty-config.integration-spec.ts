import {
  TEST_KEY_DEFAULT,
  TEST_KEY_DELETION,
  TEST_KEY_ENV_ONLY,
  TEST_KEY_METRICS,
  TEST_KEY_NONEXISTENT,
  TEST_KEY_NOTIFICATION,
  TEST_KEY_SOFT_DELETION,
  TEST_KEY_STRING_VALUE,
} from 'test/integration/twenty-config/constants/config-test-keys.constants';

import { createConfigVariable } from './utils/create-config-variable.util';
import { deleteConfigVariable } from './utils/delete-config-variable.util';
import { getConfigVariable } from './utils/get-config-variable.util';
import { getConfigVariablesGrouped } from './utils/get-config-variables-grouped.util';
import { makeUnauthenticatedAPIRequest } from './utils/make-unauthenticated-api-request.util';
import { updateConfigVariable } from './utils/update-config-variable.util';

describe('TwentyConfig Integration', () => {
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

  describe('Basic config operations', () => {
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

      expect(defaultResult.data.getDatabaseConfigVariable.source).toBe(
        'DEFAULT',
      );

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
  });

  describe('Create operations', () => {
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

    it('should reject creating config variables with invalid types', async () => {
      const result = await createConfigVariable({
        input: {
          key: TEST_KEY_DEFAULT,
          value: 'not-a-boolean',
        },
        expectToFail: true,
      });

      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('Expected boolean');
    });
  });

  describe('Update operations', () => {
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

    it('should handle concurrent updates to the same config variable', async () => {
      const testKey = TEST_KEY_METRICS;
      const initialValue = 5;
      const newValue1 = 10;
      const newValue2 = 20;

      await createConfigVariable({
        input: {
          key: testKey,
          value: initialValue,
        },
      });

      const update1 = updateConfigVariable({
        input: {
          key: testKey,
          value: newValue1,
        },
      });

      const update2 = updateConfigVariable({
        input: {
          key: testKey,
          value: newValue2,
        },
      });

      await Promise.all([update1, update2]);

      const getResult = await getConfigVariable({
        input: { key: testKey },
      });

      expect([newValue1, newValue2]).toContain(
        getResult.data.getDatabaseConfigVariable.value,
      );

      await deleteConfigVariable({
        input: { key: testKey },
      });
    });

    it('should reject updating config variables with invalid types', async () => {
      await createConfigVariable({
        input: {
          key: TEST_KEY_DEFAULT,
          value: true,
        },
      });

      const updateResult = await updateConfigVariable({
        input: {
          key: TEST_KEY_DEFAULT,
          value: 'not-a-boolean',
        },
        expectToFail: true,
      });

      expect(updateResult.errors).toBeDefined();
      expect(updateResult.errors[0].message).toContain('Expected boolean');

      await deleteConfigVariable({
        input: { key: TEST_KEY_DEFAULT },
      });
    });
  });

  describe('Delete operations', () => {
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
      expect(beforeDelete.data.getDatabaseConfigVariable.source).toBe(
        'DATABASE',
      );
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
  });

  describe('Listing operations', () => {
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
      expect(result.data.getConfigVariablesGrouped.groups).toBeInstanceOf(
        Array,
      );

      const allVariables = result.data.getConfigVariablesGrouped.groups.flatMap(
        // @ts-expect-error legacy noImplicitAny
        (group) => group.variables,
      );
      const testVariable = allVariables.find(
        // @ts-expect-error legacy noImplicitAny
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
  });

  describe('Error handling', () => {
    it('should reject modifications to environment-only variables', async () => {
      const result = await createConfigVariable({
        input: {
          key: TEST_KEY_ENV_ONLY,
          value: 'postgres://test:test@localhost:5432/test',
        },
        expectToFail: true,
      });

      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain(
        `Cannot create environment-only variable: ${TEST_KEY_ENV_ONLY}`,
      );
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
        `Config variable "${TEST_KEY_NONEXISTENT}" does not exist in ConfigVariables`,
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
      expect(response.body.errors[0].message).toContain(
        'Cannot query field "key" on type "ConfigVariable"',
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle large numeric config values', async () => {
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

    it('should handle empty string config values', async () => {
      const testKey = TEST_KEY_STRING_VALUE;
      const emptyValue = '';

      await createConfigVariable({
        input: {
          key: testKey,
          value: emptyValue,
        },
      });

      const getResult = await getConfigVariable({
        input: { key: testKey },
      });

      expect(getResult.data.getDatabaseConfigVariable.value).toBe(emptyValue);

      await deleteConfigVariable({
        input: { key: testKey },
      });
    });

    it('should preserve types correctly when retrieving config variables', async () => {
      const booleanKey = TEST_KEY_DEFAULT;
      const booleanValue = false;

      await createConfigVariable({
        input: {
          key: booleanKey,
          value: booleanValue,
        },
      });

      const boolResult = await getConfigVariable({
        input: { key: booleanKey },
      });

      const retrievedValue = boolResult.data.getDatabaseConfigVariable.value;

      expect(typeof retrievedValue).toBe('boolean');
      expect(retrievedValue).toBe(booleanValue);

      await deleteConfigVariable({
        input: { key: booleanKey },
      });
    });
  });
});
