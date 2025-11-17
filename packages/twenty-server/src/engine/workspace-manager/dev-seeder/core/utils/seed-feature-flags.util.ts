import { type QueryRunner } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

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
    .into(`${schemaName}.${tableName}`, [
      'key',
      'workspaceId',
      'value',
      'universalIdentifier',
    ])
    .orIgnore()
    .values([
      {
        key: FeatureFlagKey.IS_AIRTABLE_INTEGRATION_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: 'a3b88e65-2257-46e6-944e-c4ac4bd5c5c1',
      },
      {
        key: FeatureFlagKey.IS_POSTGRESQL_INTEGRATION_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: '030e9ea7-62f9-4b6a-99a6-b3ca320ecc3f',
      },
      {
        key: FeatureFlagKey.IS_STRIPE_INTEGRATION_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: 'ca194609-8209-412a-a848-524a9b448492',
      },
      {
        key: FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED,
        workspaceId: workspaceId,
        value: false,
        universalIdentifier: 'ce8dd2ca-83a9-4489-a9c2-4f7e94c6ee62',
      },
      {
        key: FeatureFlagKey.IS_AI_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: '9b3eb633-be47-4ed0-a2e0-875bc30ae940',
      },
      {
        key: FeatureFlagKey.IS_APPLICATION_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: '1457abc1-520a-457e-8d03-39224ee805b1',
      },
      {
        key: FeatureFlagKey.IS_IMAP_SMTP_CALDAV_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: '598d2609-560d-487b-8bad-b5f86956dd60',
      },
      {
        key: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId: workspaceId,
        value: workspaceId === SEED_APPLE_WORKSPACE_ID,
        universalIdentifier: 'bacd167d-36c5-44e3-aed7-924eba2e2b99',
      },
      {
        key: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: '86b36c5a-539c-4db3-8631-35ac089e3986',
      },
      {
        key: FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_ENABLED,
        workspaceId: workspaceId,
        value: false,
        universalIdentifier: '06ab54d7-a993-4741-87fc-988d2a6c6ac1',
      },
      {
        key: FeatureFlagKey.IS_PUBLIC_DOMAIN_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: 'e6d5e8f8-c55b-450f-b822-18bd4f138fc9',
      },
      {
        key: FeatureFlagKey.IS_EMAILING_DOMAIN_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: 'f2fc8a5c-24d3-4c56-8ace-b15db9caff87',
      },
      {
        key: FeatureFlagKey.IS_DASHBOARD_V2_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: '6c738a65-6812-41b4-86b3-c3eed7c6bd63',
      },
      {
        key: FeatureFlagKey.IS_GLOBAL_WORKSPACE_DATASOURCE_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: 'b0d31df9-1076-415b-9f96-5cc5985cf247',
      },
      {
        key: FeatureFlagKey.IS_MESSAGE_FOLDER_CONTROL_ENABLED,
        workspaceId: workspaceId,
        value: true,
        universalIdentifier: '2d4ebcb5-47ed-4079-b6b2-dc25f0c84c8a',
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
