import { type DataSource } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

const tableName = 'featureFlag';

export const seedFeatureFlags = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
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
        key: FeatureFlagKey.IS_IMAP_SMTP_CALDAV_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_MORPH_RELATION_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId: workspaceId,
        value: workspaceId === SEED_APPLE_WORKSPACE_ID,
      },
      {
        key: FeatureFlagKey.IS_COMMON_API_ENABLED,
        workspaceId: workspaceId,
        value: false,
      },
      {
        key: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_WORKFLOW_ITERATOR_ENABLED,
        workspaceId: workspaceId,
        value: false,
      },
      {
        key: FeatureFlagKey.IS_CALENDAR_VIEW_ENABLED,
        workspaceId: workspaceId,
        value: true,
      },
      {
        key: FeatureFlagKey.IS_GROUP_BY_ENABLED,
        workspaceId: workspaceId,
        value: true,
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
        key: FeatureFlagKey.IS_DYNAMIC_SEARCH_FIELDS_ENABLED,
        workspaceId: workspaceId,
        value: false,
      },
    ])
    .execute();
};

export const deleteFeatureFlags = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`"${tableName}"."workspaceId" = :workspaceId`, { workspaceId })
    .execute();
};
