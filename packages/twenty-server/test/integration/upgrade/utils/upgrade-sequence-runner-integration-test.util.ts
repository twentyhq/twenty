import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { config } from 'dotenv';
import { DataSource, type Repository } from 'typeorm';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import {
  UpgradeSequenceReaderService,
  type UpgradeStep,
  type WorkspaceUpgradeStep,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_EMPTY_WORKSPACE_3_ID,
  SEED_EMPTY_WORKSPACE_4_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

export const WS_1 = SEED_APPLE_WORKSPACE_ID;
export const WS_2 = SEED_YCOMBINATOR_WORKSPACE_ID;
export const WS_3 = SEED_EMPTY_WORKSPACE_3_ID;
export const WS_4 = SEED_EMPTY_WORKSPACE_4_ID;

const EXECUTED_BY_VERSION = '42.42.42';

const noopAsync = async () => {};

export const makeStep = (
  kind: UpgradeStep['kind'],
  name: string,
): UpgradeStep => {
  const command =
    kind === 'workspace'
      ? { runOnWorkspace: noopAsync }
      : kind === 'slow-instance'
        ? { up: noopAsync, down: noopAsync, runDataMigration: noopAsync }
        : { up: noopAsync, down: noopAsync };

  return {
    kind,
    name,
    command,
    version: '1.21.0',
    timestamp: 0,
  } as unknown as UpgradeStep;
};

export const makeFastInstance = (name: string) =>
  makeStep('fast-instance', name);

export const makeSlowInstance = (name: string) =>
  makeStep('slow-instance', name);

export const makeWorkspace = (name: string) =>
  makeStep('workspace', name) as WorkspaceUpgradeStep;

let mockActiveWorkspaceIds: string[] = [];

export const setMockActiveWorkspaceIds = (ids: string[]) => {
  mockActiveWorkspaceIds = ids;
};

export const DEFAULT_OPTIONS = {
  workspaceIds: undefined,
  startFromWorkspaceId: undefined,
  workspaceCountLimit: undefined,
  dryRun: false,
  verbose: false,
};

type IntegrationTestModule = Awaited<
  ReturnType<typeof createUpgradeSequenceRunnerIntegrationTestModule>
>;

export type IntegrationTestContext = {
  [K in keyof IntegrationTestModule]: IntegrationTestModule[K];
};

export const createUpgradeSequenceRunnerIntegrationTestModule = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.PG_DATABASE_URL,
    schema: 'core',
    entities: [
      'src/engine/core-modules/**/*.entity.ts',
      'src/engine/metadata-modules/**/*.entity.ts',
    ],
    synchronize: false,
  });

  await dataSource.initialize();

  const migrationRepo: Repository<UpgradeMigrationEntity> =
    dataSource.getRepository(UpgradeMigrationEntity);

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: getRepositoryToken(UpgradeMigrationEntity),
        useValue: migrationRepo,
      },
      {
        provide: getDataSourceToken(),
        useValue: dataSource,
      },
      {
        provide: TwentyConfigService,
        useValue: {
          get: (key: string) =>
            key === 'APP_VERSION' ? EXECUTED_BY_VERSION : undefined,
        },
      },
      UpgradeMigrationService,
      {
        provide: WorkspaceVersionService,
        useValue: {
          getActiveOrSuspendedWorkspaceIds: jest
            .fn()
            .mockImplementation(async () => mockActiveWorkspaceIds),
          hasActiveOrSuspendedWorkspaces: jest
            .fn()
            .mockImplementation(async () => mockActiveWorkspaceIds.length > 0),
        },
      },
      {
        provide: UpgradeSequenceReaderService,
        useFactory: () => new UpgradeSequenceReaderService({} as any),
      },
      {
        provide: UpgradeStatusService,
        useValue: {
          invalidateInstanceAndAllWorkspacesStatus: jest
            .fn()
            .mockResolvedValue(undefined),
        },
      },
      InstanceCommandRunnerService,
      WorkspaceCommandRunnerService,
      {
        provide: WorkspaceIteratorService,
        useValue: {
          iterate: jest.fn().mockImplementation(async (args: any) => {
            const { callback, workspaceIds } = args;
            const ids = workspaceIds ?? [WS_1];
            const report = { fail: [] as any[], success: [] as any[] };

            for (const [index, workspaceId] of ids.entries()) {
              try {
                await callback({
                  workspaceId,
                  index,
                  total: ids.length,
                  dataSource,
                });
                report.success.push({ workspaceId });
              } catch (error) {
                report.fail.push({ error, workspaceId });
              }
            }

            return report;
          }),
        },
      },
      UpgradeSequenceRunnerService,
    ],
  }).compile();

  const runner = module.get(UpgradeSequenceRunnerService);

  jest.spyOn(runner['logger'], 'log').mockImplementation();
  jest.spyOn(runner['logger'], 'error').mockImplementation();
  jest.spyOn(runner['logger'], 'warn').mockImplementation();

  const instanceCommandRunnerService = module.get(InstanceCommandRunnerService);

  jest
    .spyOn(instanceCommandRunnerService['logger'], 'log')
    .mockImplementation();
  jest
    .spyOn(instanceCommandRunnerService['logger'], 'error')
    .mockImplementation();

  const workspaceCommandRunnerService = module.get(
    WorkspaceCommandRunnerService,
  );

  jest
    .spyOn(workspaceCommandRunnerService['logger'], 'log')
    .mockImplementation();
  jest
    .spyOn(workspaceCommandRunnerService['logger'], 'error')
    .mockImplementation();

  return {
    module,
    dataSource,
    runner,
  };
};

let seedSequenceCounter = 0;

export const resetSeedSequenceCounter = () => {
  seedSequenceCounter = 0;
};

export const seedInstanceMigration = async (
  dataSource: DataSource,
  {
    name,
    status,
    workspaceIds = [],
    attempt = 1,
  }: {
    name: string;
    status: 'completed' | 'failed';
    workspaceIds?: string[];
    attempt?: number;
  },
) => {
  // Seeds must have past timestamps so the runner's NOW()-based records
  // always sort after them in createdAt order.
  const createdAt = new Date(
    Date.now() - (1000000 - seedSequenceCounter * 1000),
  ).toISOString();

  seedSequenceCounter++;

  const values: string[] = [];
  const args: unknown[] = [];
  let paramIndex = 1;

  values.push(
    `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, NULL, $${paramIndex++}, false)`,
  );
  args.push(name, status, attempt, EXECUTED_BY_VERSION, createdAt);

  for (const workspaceId of workspaceIds) {
    values.push(
      `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, false)`,
    );
    args.push(name, status, attempt, EXECUTED_BY_VERSION, workspaceId, createdAt);
  }

  await dataSource.query(
    `INSERT INTO core."upgradeMigration" (name, status, attempt, "executedByVersion", "workspaceId", "createdAt", "isInitial")
     VALUES ${values.join(', ')}`,
    args,
  );
};

export const seedWorkspaceMigration = async (
  dataSource: DataSource,
  {
    name,
    status,
    workspaceId,
    attempt = 1,
    isInitial = false,
    useCurrentTimestamp = false,
  }: {
    name: string;
    status: 'completed' | 'failed';
    workspaceId: string;
    attempt?: number;
    isInitial?: boolean;
    useCurrentTimestamp?: boolean;
  },
) => {
  if (useCurrentTimestamp) {
    await dataSource.query(
      `INSERT INTO core."upgradeMigration" (name, status, attempt, "executedByVersion", "workspaceId", "isInitial")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, status, attempt, EXECUTED_BY_VERSION, workspaceId, isInitial],
    );
  } else {
    const createdAt = new Date(
      Date.now() - (1000000 - seedSequenceCounter * 1000),
    ).toISOString();

    seedSequenceCounter++;

    await dataSource.query(
      `INSERT INTO core."upgradeMigration" (name, status, attempt, "executedByVersion", "workspaceId", "createdAt", "isInitial")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, status, attempt, EXECUTED_BY_VERSION, workspaceId, createdAt, isInitial],
    );
  }
};

export type ExecutedMigrationRecord = {
  name: string;
  status: string;
  attempt: number;
  workspaceId: string | null;
  isInitial: boolean;
};

export const testGetExecutedMigrationsInOrder = async (
  dataSource: DataSource,
): Promise<ExecutedMigrationRecord[]> => {
  return dataSource.query(
    `SELECT name, status, attempt, "workspaceId", "isInitial"
     FROM core."upgradeMigration"
     ORDER BY "createdAt" ASC, "workspaceId" ASC NULLS FIRST, attempt ASC`,
  );
};

export const migrationRecordToKey = ({
  name,
  workspaceId,
  status,
  attempt,
  isInitial,
}: ExecutedMigrationRecord): string => {
  const scope = workspaceId ?? 'instance';
  const initial = isInitial ? ':initial' : '';

  return `${name}:${scope}:${status}:${attempt}${initial}`;
};
