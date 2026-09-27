import { randomUUID } from 'crypto';

import { In } from 'typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';
import {
  type IntegrationTestContext,
  createUpgradeSequenceRunnerIntegrationTestModule,
  DEFAULT_OPTIONS,
  makeFastInstance,
  makeWorkspace,
  resetSeedSequenceCounter,
  restoreUpgradeMigrations,
  seedEmptyWorkspaces,
  seedInstanceMigration,
  setMockActiveWorkspaceIds,
  snapshotUpgradeMigrations,
  testGetExecutedMigrationsInOrder,
  WS_3,
  WS_4,
} from 'test/integration/upgrade/utils/upgrade-sequence-runner-integration-test.util';

describe('UpgradeSequenceRunnerService — workspace deletion (integration)', () => {
  const roleIds = new Map([
    [WS_3, randomUUID()],
    [WS_4, randomUUID()],
  ]);
  let context: IntegrationTestContext;
  let savedUpgradeMigrations: Awaited<
    ReturnType<typeof snapshotUpgradeMigrations>
  >;
  let savedWorkspaceStates: Pick<
    WorkspaceEntity,
    'id' | 'activationStatus' | 'deletedAt' | 'defaultRoleId' | 'databaseSchema'
  >[];

  beforeAll(async () => {
    context = await createUpgradeSequenceRunnerIntegrationTestModule({
      useRealWorkspaceIterator: true,
    });
    savedUpgradeMigrations = await snapshotUpgradeMigrations(
      context.dataSource,
    );
    savedWorkspaceStates = await context.dataSource
      .getRepository(WorkspaceEntity)
      .find({
        where: { id: In([WS_3, WS_4]) },
        select: [
          'id',
          'activationStatus',
          'deletedAt',
          'defaultRoleId',
          'databaseSchema',
        ],
        withDeleted: true,
      });
  }, 30000);

  afterAll(async () => {
    await seedEmptyWorkspaces(context.dataSource);
    for (const { id, ...state } of savedWorkspaceStates) {
      await context.dataSource.getRepository(WorkspaceEntity).update(id, state);
    }
    await context.dataSource
      .getRepository(RoleEntity)
      .delete([...roleIds.values()]);
    await restoreUpgradeMigrations(context.dataSource, savedUpgradeMigrations);
    await context.module.close();
    await context.dataSource.destroy();
  }, 15000);

  beforeEach(async () => {
    jest.restoreAllMocks();
    await context.dataSource.query('DELETE FROM core."upgradeMigration"');
    await seedEmptyWorkspaces(context.dataSource);
    const repository = context.dataSource.getRepository(WorkspaceEntity);
    await repository.restore([WS_3, WS_4]);
    for (const [workspaceId, roleId] of roleIds) {
      const workspace = await repository.findOneByOrFail({ id: workspaceId });
      await context.dataSource.getRepository(RoleEntity).save({
        id: roleId,
        universalIdentifier: roleId,
        workspaceId,
        applicationId: workspace.workspaceCustomApplicationId,
        label: 'Upgrade deletion test role',
      });
      await repository.update(workspaceId, {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        defaultRoleId: roleId,
        databaseSchema: 'core',
      });
    }
    resetSeedSequenceCounter();
    setMockActiveWorkspaceIds([WS_3, WS_4]);
    const workspaceVersionService = new WorkspaceVersionService(repository);

    jest
      .spyOn(
        context.module.get(WorkspaceVersionService),
        'getProvisionedWorkspaceIds',
      )
      .mockImplementation(async () =>
        (await workspaceVersionService.getProvisionedWorkspaceIds()).filter(
          (workspaceId) => [WS_3, WS_4].includes(workspaceId),
        ),
      );
    await seedInstanceMigration(context.dataSource, {
      name: 'initial',
      status: 'completed',
      workspaceIds: [WS_3, WS_4],
    });
  });

  it.each(['soft', 'hard'] as const)(
    'skips a %s-deleted target and passes the next instance barrier',
    async (deletion) => {
      const iterator = context.module.get(WorkspaceIteratorService);
      const iterate = iterator.iterate.bind(iterator);
      jest.spyOn(iterator, 'iterate').mockImplementationOnce(async (args) => {
        const repository = context.dataSource.getRepository(WorkspaceEntity);
        if (deletion === 'soft') {
          await repository.softDelete(WS_4);
        } else {
          await repository.delete(WS_4);
        }
        return iterate(args);
      });
      const workspaceStep = makeWorkspace('workspace-step');
      const runOnWorkspace = jest.spyOn(
        workspaceStep.command,
        'runOnWorkspace',
      );

      const report = await context.runner.run({
        sequence: [
          makeFastInstance('initial'),
          workspaceStep,
          makeFastInstance('next-instance'),
        ],
        options: DEFAULT_OPTIONS,
      });

      expect(report).toEqual({ totalSuccesses: 1, totalFailures: 0 });
      expect(runOnWorkspace).toHaveBeenCalledTimes(1);
      expect(runOnWorkspace).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: WS_3 }),
      );
      expect(
        await testGetExecutedMigrationsInOrder(context.dataSource),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'next-instance',
            workspaceId: null,
            status: 'completed',
          }),
        ]),
      );
    },
  );

  it.each(['soft', 'hard'] as const)(
    'handles %s deletion during a command without failing live workspaces',
    async (deletion) => {
      const workspaceStep = makeWorkspace('workspace-step');
      jest
        .spyOn(workspaceStep.command, 'runOnWorkspace')
        .mockImplementation(async ({ workspaceId }) => {
          if (workspaceId !== WS_4) return;
          const repository = context.dataSource.getRepository(WorkspaceEntity);
          if (deletion === 'soft') {
            await repository.softDelete(workspaceId);
            throw new Error('No workspace data source');
          }
          await repository.delete(workspaceId);
        });

      const report = await context.runner.run({
        sequence: [
          makeFastInstance('initial'),
          workspaceStep,
          makeFastInstance('next-instance'),
        ],
        options: DEFAULT_OPTIONS,
      });

      expect(report).toEqual({ totalSuccesses: 1, totalFailures: 0 });
      expect(
        await testGetExecutedMigrationsInOrder(context.dataSource),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'next-instance',
            workspaceId: null,
            status: 'completed',
          }),
        ]),
      );
    },
  );

  it('keeps an empty cohort empty after every target is deleted', async () => {
    const iterator = context.module.get(WorkspaceIteratorService);
    const iterate = iterator.iterate.bind(iterator);
    const iterateSpy = jest
      .spyOn(iterator, 'iterate')
      .mockImplementationOnce(async (args) => {
        await context.dataSource
          .getRepository(WorkspaceEntity)
          .softDelete([WS_3, WS_4]);
        return iterate(args);
      });

    const report = await context.runner.run({
      sequence: [
        makeFastInstance('initial'),
        makeWorkspace('workspace-step'),
        makeFastInstance('next-instance'),
        makeWorkspace('next-workspace'),
      ],
      options: DEFAULT_OPTIONS,
    });

    expect(report).toEqual({ totalSuccesses: 0, totalFailures: 0 });
    expect(iterateSpy).toHaveBeenCalledTimes(1);
  });

  it('still aborts before the next instance command when a live workspace fails', async () => {
    const workspaceStep = makeWorkspace('workspace-step');
    jest
      .spyOn(workspaceStep.command, 'runOnWorkspace')
      .mockImplementation(async ({ workspaceId }) => {
        if (workspaceId === WS_4) throw new Error('command failed');
      });

    const report = await context.runner.run({
      sequence: [
        makeFastInstance('initial'),
        workspaceStep,
        makeFastInstance('next-instance'),
      ],
      options: DEFAULT_OPTIONS,
    });

    expect(report.totalFailures).toBe(1);
    const migrations = await testGetExecutedMigrationsInOrder(
      context.dataSource,
    );
    expect(migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'workspace-step',
          workspaceId: WS_4,
          status: 'failed',
        }),
      ]),
    );
    expect(migrations.some(({ name }) => name === 'next-instance')).toBe(false);
  });
});
