import nodeFetch from 'node-fetch';
import { type JestConfigWithTsJest } from 'ts-jest';
import 'tsconfig-paths/register';

import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkflowPrefillIds } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflows.util';

import { createApp } from './create-app';
import { createWorkflowTestServices } from './create-workflow-test-services';
import { waitForTestDatabaseReset } from './wait-for-test-database-reset.util';

const deactivateSeededCreateCompanyWorkflowVersion = async () => {
  const { coreCreateCompanyWorkflowVersionId } = getWorkflowPrefillIds(
    SEED_APPLE_WORKSPACE_ID,
  );

  await rawDataSource.query(
    `UPDATE core."workflowVersion" SET status = 'DEACTIVATED' WHERE id = $1 AND status = 'ACTIVE'`,
    [coreCreateCompanyWorkflowVersionId],
  );
};

export default async (_: unknown, projectConfig: JestConfigWithTsJest) => {
  // node-fetch rides node:http, which msw patches; native undici fetch
  // escapes interception.
  globalThis.fetch = nodeFetch as unknown as typeof globalThis.fetch;

  await waitForTestDatabaseReset();
  await rawDataSource.initialize();
  await deactivateSeededCreateCompanyWorkflowVersion();

  const app = await createApp({});

  if (!projectConfig.globals) {
    throw new Error('No globals found in project config');
  }

  await app
    .get(WorkspaceCacheService)
    .invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatWorkflowVersionMaps',
      'workflowAutomatedTriggerMaps',
    ]);

  await app.listen(projectConfig.globals.APP_PORT as number);

  global.app = app;
  global.workflowTestServices = createWorkflowTestServices(app);
  global.testDataSource = rawDataSource;
  global.jobDrainState = { lastStalledFingerprint: null };
};
