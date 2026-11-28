import {
  type CapturedQuery,
  findUnindexedCatalogScans,
  type UnindexedCatalogScan,
} from 'test/integration/upgrade/utils/find-unindexed-catalog-scans.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type DataSource } from 'typeorm';

import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// A workspace command runs once per workspace on the shared writer, so a lookup that
// scans the whole catalog costs workspaces × catalog size (the 2.65 incident).
describe('workspace commands of the current version - catalog cost (integration)', () => {
  it('only read the catalog through an index', async () => {
    const coreDataSource = getAppProviderByClassName<DataSource>('DataSource');
    const { workspaceCommands } =
      getAppProviderByClassName<UpgradeCommandRegistryService>(
        'UpgradeCommandRegistryService',
      ).getBundleForVersion(TWENTY_CURRENT_VERSION);

    const queriesByCommandName = new Map<string, CapturedQuery[]>();
    let currentCommandQueries: CapturedQuery[] = [];

    const recordQuery = (query: string, parameters?: unknown[]) => {
      currentCommandQueries.push({ query, parameters });
    };

    jest
      .spyOn(coreDataSource.logger, 'logQuery')
      .mockImplementation(recordQuery);
    jest
      .spyOn(global.testDataSource.logger, 'logQuery')
      .mockImplementation(recordQuery);

    try {
      for (const { name, command } of workspaceCommands) {
        currentCommandQueries = [];
        queriesByCommandName.set(name, currentCommandQueries);

        // Dry run: catalog lookups happen before a command decides what to write.
        await command.runOnWorkspace({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          options: { dryRun: true },
          dataSource: coreDataSource,
          index: 0,
          total: 1,
        });
      }
    } finally {
      jest.restoreAllMocks();
    }

    const unindexedScansByCommandName: Record<string, UnindexedCatalogScan[]> =
      {};

    for (const [name, capturedQueries] of queriesByCommandName) {
      const unindexedScans = await findUnindexedCatalogScans({
        dataSource: global.testDataSource,
        capturedQueries,
      });

      if (unindexedScans.length > 0) {
        unindexedScansByCommandName[name] = unindexedScans;
      }
    }

    expect(unindexedScansByCommandName).toEqual({});
  });
});
