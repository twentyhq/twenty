import { type DataSource } from 'typeorm';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { seedBillingCustomers } from 'src/engine/workspace-manager/dev-seeder/core/billing/utils/seed-billing-customers.util';
import { seedBillingSubscriptions } from 'src/engine/workspace-manager/dev-seeder/core/billing/utils/seed-billing-subscriptions.util';
import {
  type SeededWorkspacesIds,
  SEEDER_CREATE_WORKSPACE_INPUT,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { seedAgents } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-agents.util';
import { seedApiKeys } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-api-keys.util';
import { seedFeatureFlags } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-feature-flags.util';
import { seedUserWorkspaces } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { seedUsers } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { createWorkspace } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspace.util';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

type SeedCoreSchemaArgs = {
  dataSource: DataSource;
  workspaceId: SeededWorkspacesIds;
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

  const createWorkspaceStaticInput = SEEDER_CREATE_WORKSPACE_INPUT[workspaceId];
  const version = extractVersionMajorMinorPatch(appVersion);
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const customWorkspaceApplication =
      await applicationService.createWorkspaceCustomApplication(
        {
          workspaceId,
          workspaceDisplayName: createWorkspaceStaticInput.displayName,
        },
        queryRunner,
      );

    await createWorkspace({
      queryRunner,
      schemaName,
      createWorkspaceInput: {
        ...createWorkspaceStaticInput,
        version,
        workspaceCustomApplicationId: customWorkspaceApplication.id,
      },
    });

    await seedUsers({ queryRunner, schemaName });

    await seedUserWorkspaces({ queryRunner, schemaName, workspaceId });

    await applicationService.createTwentyStandardApplication(
      {
        workspaceId,
        skipCacheInvalidation: true,
      },
      queryRunner,
    );

    await seedAgents({ queryRunner, schemaName, workspaceId });

    await seedApiKeys({ queryRunner, schemaName, workspaceId });

    if (shouldSeedFeatureFlags) {
      await seedFeatureFlags({ queryRunner, schemaName, workspaceId });
    }

    if (seedBilling) {
      await seedBillingCustomers({ queryRunner, schemaName, workspaceId });
      await seedBillingSubscriptions({ queryRunner, schemaName, workspaceId });
    }

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};
