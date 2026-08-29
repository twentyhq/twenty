import { TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-cross-upgrade-supported-version.constant';
import { type UpgradeStep } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';

import {
  type IntegrationTestContext,
  createUpgradeSequenceRunnerIntegrationTestModule,
  DEFAULT_OPTIONS,
  makeVersionedStep,
  resetSeedSequenceCounter,
  restoreUpgradeMigrations,
  seedInstanceMigration,
  setMockActiveWorkspaceIds,
  snapshotUpgradeMigrations,
  WS_1,
} from 'test/integration/upgrade/utils/upgrade-sequence-runner-integration-test.util';

// The sequence only ever covers supported versions, and the skip rule walks
// that same list, so the fixture has to be built from real ones.
const [OLDEST_VERSION, MIDDLE_VERSION, NEWEST_VERSION] =
  TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS.slice(-3);

const OLDEST_INSTANCE_COMMAND = makeVersionedStep('fast-instance', {
  version: OLDEST_VERSION,
  label: 'OldestInstanceCommand',
});
const OLDEST_SLOW_INSTANCE_COMMAND = makeVersionedStep('slow-instance', {
  version: OLDEST_VERSION,
  label: 'OldestSlowInstanceCommand',
});
const MIDDLE_INSTANCE_COMMAND = makeVersionedStep('fast-instance', {
  version: MIDDLE_VERSION,
  label: 'MiddleInstanceCommand',
});
const NEWEST_INSTANCE_COMMAND = makeVersionedStep('fast-instance', {
  version: NEWEST_VERSION,
  label: 'NewestInstanceCommand',
});
const NEWEST_WORKSPACE_COMMAND = makeVersionedStep('workspace', {
  version: NEWEST_VERSION,
  label: 'NewestWorkspaceCommand',
});

describe('UpgradeStatusService — instance completed version (integration)', () => {
  let context: IntegrationTestContext;
  let savedUpgradeMigrations: Awaited<
    ReturnType<typeof snapshotUpgradeMigrations>
  >;

  const mockSequence = (sequence: UpgradeStep[]) => {
    jest
      .spyOn(context.upgradeSequenceReaderService, 'getUpgradeSequence')
      .mockReturnValue(sequence);
  };

  beforeAll(async () => {
    context = await createUpgradeSequenceRunnerIntegrationTestModule();
    savedUpgradeMigrations = await snapshotUpgradeMigrations(
      context.dataSource,
    );
  }, 30000);

  afterAll(async () => {
    await restoreUpgradeMigrations(context.dataSource, savedUpgradeMigrations);
    await context.module?.close();
    await context.dataSource?.destroy();
  }, 15000);

  beforeEach(async () => {
    await context.dataSource.query('DELETE FROM core."upgradeMigration"');
    resetSeedSequenceCounter();
    setMockActiveWorkspaceIds([]);
    jest.restoreAllMocks();
  });

  it('should return null when no instance command has ever run', async () => {
    mockSequence([OLDEST_INSTANCE_COMMAND, MIDDLE_INSTANCE_COMMAND]);

    await expect(
      context.upgradeStatusService.getInstanceCompletedVersion(),
    ).resolves.toBeNull();
  });

  it('should reach a trailing version that ships no instance command', async () => {
    mockSequence([MIDDLE_INSTANCE_COMMAND, NEWEST_WORKSPACE_COMMAND]);

    await seedInstanceMigration(context.dataSource, {
      name: MIDDLE_INSTANCE_COMMAND.name,
      status: 'completed',
    });

    await expect(
      context.upgradeStatusService.getInstanceCompletedVersion(),
    ).resolves.toBe(NEWEST_VERSION);
  });

  it('should hold at the previous version while the trailing instance command has not run', async () => {
    mockSequence([MIDDLE_INSTANCE_COMMAND, NEWEST_INSTANCE_COMMAND]);

    await seedInstanceMigration(context.dataSource, {
      name: MIDDLE_INSTANCE_COMMAND.name,
      status: 'completed',
    });

    await expect(
      context.upgradeStatusService.getInstanceCompletedVersion(),
    ).resolves.toBe(MIDDLE_VERSION);
  });

  it('should not credit a version whose last instance command failed', async () => {
    mockSequence([MIDDLE_INSTANCE_COMMAND, NEWEST_INSTANCE_COMMAND]);

    await seedInstanceMigration(context.dataSource, {
      name: MIDDLE_INSTANCE_COMMAND.name,
      status: 'completed',
    });
    await seedInstanceMigration(context.dataSource, {
      name: NEWEST_INSTANCE_COMMAND.name,
      status: 'failed',
    });

    await expect(
      context.upgradeStatusService.getInstanceCompletedVersion(),
    ).resolves.toBe(MIDDLE_VERSION);
  });

  it('should credit a version once its failed command is retried successfully', async () => {
    mockSequence([MIDDLE_INSTANCE_COMMAND, NEWEST_INSTANCE_COMMAND]);

    await seedInstanceMigration(context.dataSource, {
      name: MIDDLE_INSTANCE_COMMAND.name,
      status: 'completed',
    });
    await seedInstanceMigration(context.dataSource, {
      name: NEWEST_INSTANCE_COMMAND.name,
      status: 'failed',
    });
    await seedInstanceMigration(context.dataSource, {
      name: NEWEST_INSTANCE_COMMAND.name,
      status: 'completed',
      attempt: 2,
    });

    await expect(
      context.upgradeStatusService.getInstanceCompletedVersion(),
    ).resolves.toBe(NEWEST_VERSION);
  });

  it('should not credit a version while earlier instance commands of that version remain', async () => {
    mockSequence([OLDEST_INSTANCE_COMMAND, OLDEST_SLOW_INSTANCE_COMMAND]);

    await seedInstanceMigration(context.dataSource, {
      name: OLDEST_INSTANCE_COMMAND.name,
      status: 'completed',
    });

    await expect(
      context.upgradeStatusService.getInstanceCompletedVersion(),
    ).resolves.toBeNull();
  });

  it('should report the version reached after the runner executes the whole sequence', async () => {
    const sequence = [
      OLDEST_INSTANCE_COMMAND,
      MIDDLE_INSTANCE_COMMAND,
      NEWEST_WORKSPACE_COMMAND,
    ];

    mockSequence(sequence);
    setMockActiveWorkspaceIds([WS_1]);

    // The runner resumes from a cursor, so the sequence needs a starting point.
    await seedInstanceMigration(context.dataSource, {
      name: OLDEST_INSTANCE_COMMAND.name,
      status: 'completed',
      workspaceIds: [WS_1],
    });

    await context.runner.run({
      sequence,
      options: DEFAULT_OPTIONS,
    });

    await expect(
      context.upgradeStatusService.getInstanceCompletedVersion(),
    ).resolves.toBe(NEWEST_VERSION);
  });
});
