import { type DataSource } from 'typeorm';

import { seedBillingSubscriptions } from 'src/engine/workspace-manager/dev-seeder/core/billing/utils/seed-billing-subscriptions.util';
import { seedAgents } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-agents.util';
import { seedApiKeys } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-api-keys.util';
import { seedFeatureFlags } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-feature-flags.util';
import { seedPageLayouts } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-page-layouts.util';
import { seedPageLayoutWidgets } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-page-layout-widgets.util';
import { seedUserWorkspaces } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { seedUsers } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { seedWorkspaces } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

type SeedCoreSchemaArgs = {
  dataSource: DataSource;
  workspaceId: string;
  appVersion: string | undefined;
  seedBilling?: boolean;
  seedFeatureFlags?: boolean;
  seedPageLayouts?: boolean;
};

export const seedCoreSchema = async ({
  appVersion,
  dataSource,
  workspaceId,
  seedBilling = true,
  seedFeatureFlags: shouldSeedFeatureFlags = true,
  seedPageLayouts: shouldSeedPageLayouts = true,
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

  await seedAgents(dataSource, schemaName, workspaceId);

  await seedApiKeys(dataSource, schemaName, workspaceId);

  if (shouldSeedFeatureFlags) {
    await seedFeatureFlags(dataSource, schemaName, workspaceId);
  }

  if (seedBilling) {
    await seedBillingSubscriptions(dataSource, schemaName, workspaceId);
  }

  if (shouldSeedPageLayouts) {
    await seedPageLayouts(dataSource, schemaName, workspaceId);
    await seedPageLayoutWidgets(dataSource, schemaName, workspaceId);
  }
};
