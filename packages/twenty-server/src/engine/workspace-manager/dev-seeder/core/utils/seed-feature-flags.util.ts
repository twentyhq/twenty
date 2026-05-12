import { FeatureFlagKey } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

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
        key: FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED,
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
        key: FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_JUNCTION_RELATIONS_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_MARKETPLACE_SETTING_TAB_VISIBLE,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED,
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
