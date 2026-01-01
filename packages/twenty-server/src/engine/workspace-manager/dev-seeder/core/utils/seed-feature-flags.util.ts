import { type QueryRunner } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

const tableName = 'featureFlag';

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
    .values([
      {
        key: FeatureFlagKey.IS_AIRTABLE_INTEGRATION_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_POSTGRESQL_INTEGRATION_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_STRIPE_INTEGRATION_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED,
        workspaceId: workspaceId,
        value: false,
      },
      {
        key: FeatureFlagKey.IS_AI_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_APPLICATION_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_ENABLED,
        workspaceId: workspaceId,
        value: false,
      },
      {
        key: FeatureFlagKey.IS_PUBLIC_DOMAIN_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_EMAILING_DOMAIN_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_DASHBOARD_V2_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_IF_ELSE_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
    ])
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
