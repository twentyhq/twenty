import { type DataSource } from 'typeorm';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { seedBillingCustomers } from 'src/engine/workspace-manager/dev-seeder/core/billing/utils/seed-billing-customers.util';
import { seedBillingSubscriptions } from 'src/engine/workspace-manager/dev-seeder/core/billing/utils/seed-billing-subscriptions.util';
import { seedAgents } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-agents.util';
import { seedApiKeys } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-api-keys.util';
import { seedFeatureFlags } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-feature-flags.util';
import { seedStandardApplications } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-standard-applications.util';
import { seedUserWorkspaces } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { seedUsers } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { seedWorkspaces } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

type SeedCoreSchemaArgs = {
  dataSource: DataSource;
  workspaceId: string;
  appVersion: string | undefined;
  applicationService: ApplicationService;
  seedBilling?: boolean;
  seedFeatureFlags?: boolean;
};

export const seedCoreSchema = async ({
  appVersion,
  dataSource,
  workspaceId,
  applicationService,
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

  await seedStandardApplications(applicationService, workspaceId);

  await seedAgents(dataSource, schemaName, workspaceId);

  await seedApiKeys(dataSource, schemaName, workspaceId);

  if (shouldSeedFeatureFlags) {
    await seedFeatureFlags(dataSource, schemaName, workspaceId);
  }

  if (seedBilling) {
    await seedBillingCustomers(dataSource, schemaName, workspaceId);
    await seedBillingSubscriptions(dataSource, schemaName, workspaceId);
  }
};
