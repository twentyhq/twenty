import { isNonEmptyString } from '@sniptt/guards';
import { FeatureFlagKey } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

const tableName = 'featureFlag';

const DEFAULT_SEEDED_FEATURE_FLAGS: Partial<Record<FeatureFlagKey, boolean>> = {
  [FeatureFlagKey.IS_APP_CLAIMING_ENABLED]: false,
  [FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED]: false,
  [FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED]: true,
  [FeatureFlagKey.IS_EMAIL_GROUP_ENABLED]: true,
  [FeatureFlagKey.IS_JUNCTION_RELATIONS_ENABLED]: true,
  [FeatureFlagKey.IS_SETTINGS_DISCOVERY_HERO_ENABLED]: false,
};

// Lets a CI job run the whole suite against a flagged code path, e.g.
// TEST_FORCED_FEATURE_FLAGS=IS_ORM_V2_READ_PATH_ENABLED. An unknown name throws rather
// than being skipped: a typo would otherwise leave the run green without testing anything.
const getForcedFeatureFlags = (): FeatureFlagKey[] => {
  const forcedFeatureFlags = process.env.TEST_FORCED_FEATURE_FLAGS;

  if (!isNonEmptyString(forcedFeatureFlags)) {
    return [];
  }

  return forcedFeatureFlags
    .split(',')
    .map((featureFlagKey) => featureFlagKey.trim())
    .filter(isNonEmptyString)
    .map((featureFlagKey) => {
      if (
        !Object.values(FeatureFlagKey).includes(
          featureFlagKey as FeatureFlagKey,
        )
      ) {
        throw new Error(
          `Unknown feature flag "${featureFlagKey}" in TEST_FORCED_FEATURE_FLAGS`,
        );
      }

      return featureFlagKey as FeatureFlagKey;
    });
};

type SeedFeatureFlagsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedFeatureFlags = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedFeatureFlagsArgs) => {
  const featureFlagValueByKey: Partial<Record<FeatureFlagKey, boolean>> = {
    ...DEFAULT_SEEDED_FEATURE_FLAGS,
  };

  for (const featureFlagKey of getForcedFeatureFlags()) {
    featureFlagValueByKey[featureFlagKey] = true;
  }

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['key', 'workspaceId', 'value'])
    .orIgnore()
    .values(
      Object.entries(featureFlagValueByKey).map(([key, value]) => ({
        key,
        workspaceId,
        value,
      })),
    )
    .execute();
};

type DeleteFeatureFlagsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const deleteFeatureFlags = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: DeleteFeatureFlagsArgs) => {
  await queryRunner.manager
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`"${tableName}"."workspaceId" = :workspaceId`, { workspaceId })
    .execute();
};
