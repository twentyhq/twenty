import { FeatureFlagKey } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

import { seedFeatureFlags } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-feature-flags.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const buildQueryRunner = () => {
  const seededValues: { key: string; workspaceId: string; value: boolean }[] =
    [];

  const queryBuilder = {
    insert: () => queryBuilder,
    into: () => queryBuilder,
    orIgnore: () => queryBuilder,
    values: (values: typeof seededValues) => {
      seededValues.push(...values);

      return queryBuilder;
    },
    execute: async () => undefined,
  };

  return {
    seededValues,
    queryRunner: {
      manager: { createQueryBuilder: () => queryBuilder },
    } as unknown as QueryRunner,
  };
};

const seed = async () => {
  const { queryRunner, seededValues } = buildQueryRunner();

  await seedFeatureFlags({
    queryRunner,
    schemaName: 'core',
    workspaceId: WORKSPACE_ID,
  });

  return seededValues;
};

describe('seedFeatureFlags', () => {
  const initialEnv = process.env.TEST_FORCED_FEATURE_FLAGS;

  afterEach(() => {
    process.env.TEST_FORCED_FEATURE_FLAGS = initialEnv;
  });

  it('should not seed a flag that was not asked for', async () => {
    delete process.env.TEST_FORCED_FEATURE_FLAGS;

    const seededValues = await seed();

    expect(
      seededValues.find(
        ({ key }) => key === FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
      ),
    ).toBeUndefined();
  });

  it('should seed a forced flag as enabled', async () => {
    process.env.TEST_FORCED_FEATURE_FLAGS =
      FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED;

    const seededValues = await seed();

    expect(
      seededValues.find(
        ({ key }) => key === FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
      ),
    ).toEqual({
      key: FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
      workspaceId: WORKSPACE_ID,
      value: true,
    });
  });

  it('should keep seeding the default flags alongside a forced one', async () => {
    process.env.TEST_FORCED_FEATURE_FLAGS =
      FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED;

    const seededValues = await seed();

    expect(
      seededValues.find(
        ({ key }) => key === FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
      )?.value,
    ).toBe(true);
  });

  it('should override a default that is seeded as disabled', async () => {
    process.env.TEST_FORCED_FEATURE_FLAGS =
      FeatureFlagKey.IS_APP_CLAIMING_ENABLED;

    const seededValues = await seed();

    expect(
      seededValues.filter(
        ({ key }) => key === FeatureFlagKey.IS_APP_CLAIMING_ENABLED,
      ),
    ).toEqual([
      {
        key: FeatureFlagKey.IS_APP_CLAIMING_ENABLED,
        workspaceId: WORKSPACE_ID,
        value: true,
      },
    ]);
  });

  it('should accept several flags', async () => {
    process.env.TEST_FORCED_FEATURE_FLAGS = `${FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED}, ${FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED}`;

    const seededValues = await seed();

    expect(
      seededValues.filter(
        ({ key, value }) =>
          [
            FeatureFlagKey.IS_ORM_V2_READ_PATH_ENABLED,
            FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED,
          ].includes(key as FeatureFlagKey) && value === true,
      ),
    ).toHaveLength(2);
  });

  it('should throw on an unknown flag name', async () => {
    process.env.TEST_FORCED_FEATURE_FLAGS = 'IS_ORM_V2_READ_PATH_ENABLE';

    await expect(seed()).rejects.toThrow(
      'Unknown feature flag "IS_ORM_V2_READ_PATH_ENABLE"',
    );
  });
});
