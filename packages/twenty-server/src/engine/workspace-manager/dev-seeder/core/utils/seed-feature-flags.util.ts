import { FeatureFlagKey } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

const tableName = 'featureFlag';

const DEFAULT_SEEDED_FEATURE_FLAGS: Partial<Record<FeatureFlagKey, boolean>> = {
  [FeatureFlagKey.IS_APP_CLAIMING_ENABLED]: false,
  [FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED]: false,
  [FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED]: true,
  [FeatureFlagKey.IS_EMAIL_GROUP_ENABLED]: true,
  [FeatureFlagKey.IS_JUNCTION_RELATIONS_ENABLED]: true,
  [FeatureFlagKey.IS_WORKFLOW_VERSION_IN_CORE_ENABLED]: true,
  [FeatureFlagKey.IS_WORKFLOW_DISPATCH_FROM_CORE_ENABLED]: true,
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
  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['key', 'workspaceId', 'value'])
    .orIgnore()
    .values(
      Object.entries(DEFAULT_SEEDED_FEATURE_FLAGS).map(([key, value]) => ({
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
