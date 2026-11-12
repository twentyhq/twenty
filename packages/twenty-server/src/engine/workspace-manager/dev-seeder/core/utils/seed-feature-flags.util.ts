import { FeatureFlagKey } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

const tableName = 'featureFlag';

const DEFAULT_SEEDED_FEATURE_FLAGS: Partial<Record<FeatureFlagKey, boolean>> = {
  [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: false,
  [FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED]: true,
  [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]: true,
  [FeatureFlagKey.IS_MCP_SERVERS_ENABLED]: true,
  [FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED]: true,
  [FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED]: false,
  [FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED]: false,
  [FeatureFlagKey.IS_GETTING_STARTED_ENABLED]: true,
  [FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED]: true,
  [FeatureFlagKey.IS_AI_DATA_POLICY_ENABLED]: true,
  [FeatureFlagKey.IS_CREATE_RECORDS_PERMISSION_ENABLED]: false,
  [FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED]: false,
  [FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED]: false,
  [FeatureFlagKey.IS_PERMISSION_TABLES_ENABLED]: false,
  [FeatureFlagKey.IS_RECORD_GROUP_TABS_ENABLED]: true,
  [FeatureFlagKey.IS_HTTP_EGRESS_LAMBDA_ENABLED]: false,
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
