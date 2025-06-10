import { DataSource } from 'typeorm';

import { seedBillingSubscriptions } from 'src/engine/workspace-manager/dev-seeder/core/billing/utils/seed-billing-subscriptions.util';
import { seedFeatureFlags } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-feature-flags.util';
import { seedUserWorkspaces } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { seedUsers } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { seedWorkspaces } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

type SeedCoreSchemaArgs = {
  dataSource: DataSource;
  workspaceId: string;
  appVersion: string | undefined;
  seedBilling?: boolean;
  seedFeatureFlags?: boolean;
};

export const seedCoreSchema = async ({
  appVersion,
  dataSource,
  workspaceId,
  seedBilling = true,
  seedFeatureFlags: shouldSeedFeatureFlags = true,
}: SeedCoreSchemaArgs) => {
  const schemaName = 'core';

  await seedWorkspaces({
    dataSource,
    schemaName,
    workspaceId,
    appVersion,
  });
  await seedUsers(dataSource, schemaName);
  await seedUserWorkspaces(dataSource, schemaName, workspaceId);

  if (shouldSeedFeatureFlags) {
    await seedFeatureFlags(dataSource, schemaName, workspaceId);
  }

  if (seedBilling) {
    await seedBillingSubscriptions(dataSource, schemaName, workspaceId);
  }
};
