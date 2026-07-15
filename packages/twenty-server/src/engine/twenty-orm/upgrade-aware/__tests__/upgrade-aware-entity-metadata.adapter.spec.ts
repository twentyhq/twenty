import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { type DataSource } from 'typeorm';
import { type ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { type EntityMetadata } from 'typeorm/metadata/EntityMetadata';

import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WasRemovedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { WasRenamedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UPGRADE_METADATA_REFRESH_INTERVAL_MS } from 'src/engine/twenty-orm/upgrade-aware/constants/upgrade-metadata-refresh-interval.constant';
import { UpgradeAwareEntityMetadataAdapter } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-entity-metadata.adapter';

const RENAME_STEP = '2.6.0_Rename_1700000000000';
const INTRODUCE_STEP = '2.7.0_AddColumn_1800000000000';
const REMOVE_STEP = '2.7.0_DropColumn_1800000000001';

@WasRenamedInUpgrade([
  { previousName: 'oldEntity', upgradeCommandName: RENAME_STEP },
])
class RenamedEntity {}

class EntityWithHideableColumns {
  @WasIntroducedInUpgrade({ upgradeCommandName: INTRODUCE_STEP })
  introducedColumn!: string;

  @WasRemovedInUpgrade({ upgradeCommandName: REMOVE_STEP })
  removedColumn!: string;

  visibleColumn!: string;
}

const buildColumn = (propertyName: string): ColumnMetadata =>
  ({
    propertyName,
    databaseName: propertyName,
    isSelect: true,
    isInsert: true,
    isUpdate: true,
  }) as unknown as ColumnMetadata;

const flushMicrotasks = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('UpgradeAwareEntityMetadataAdapter', () => {
  it('rewrites tableName / tablePath / givenTableName when the rename step is not yet applied', async () => {
    const metadata = {
      target: RenamedEntity,
      tableName: 'newEntity',
      tablePath: 'core.newEntity',
      givenTableName: 'newEntity',
      schema: 'core',
      columns: [],
    } as unknown as EntityMetadata;

    const dataSource = {
      entityMetadatas: [metadata],
    } as unknown as DataSource;

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpgradeAwareEntityMetadataAdapter,
        {
          provide: UpgradeMigrationService,
          useValue: {
            getLastAttemptedInstanceCommand: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: {
            getUpgradeSequence: jest
              .fn()
              .mockReturnValue([{ name: RENAME_STEP }]),
          },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    const adapter = moduleRef.get(UpgradeAwareEntityMetadataAdapter);

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(metadata.tableName).toBe('oldEntity');
    expect(metadata.tablePath).toBe('core.oldEntity');
    expect(metadata.givenTableName).toBe('oldEntity');
  });

  it('disables isSelect, isInsert and isUpdate for hidden columns (intro pending + removal applied) while leaving the visible sibling untouched', async () => {
    const introducedColumn = buildColumn('introducedColumn');
    const removedColumn = buildColumn('removedColumn');
    const visibleColumn = buildColumn('visibleColumn');

    const metadata = {
      target: EntityWithHideableColumns,
      tableName: 'entityWithHideableColumns',
      tablePath: 'core.entityWithHideableColumns',
      givenTableName: 'entityWithHideableColumns',
      schema: 'core',
      columns: [introducedColumn, removedColumn, visibleColumn],
    } as unknown as EntityMetadata;

    const dataSource = {
      entityMetadatas: [metadata],
    } as unknown as DataSource;

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpgradeAwareEntityMetadataAdapter,
        {
          provide: UpgradeMigrationService,
          useValue: {
            getLastAttemptedInstanceCommand: jest.fn().mockResolvedValue({
              name: REMOVE_STEP,
              status: 'completed',
            }),
          },
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: {
            getUpgradeSequence: jest
              .fn()
              .mockReturnValue([
                { name: REMOVE_STEP },
                { name: INTRODUCE_STEP },
              ]),
          },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    const adapter = moduleRef.get(UpgradeAwareEntityMetadataAdapter);

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(introducedColumn.isSelect).toBe(false);
    expect(introducedColumn.isInsert).toBe(false);
    expect(introducedColumn.isUpdate).toBe(false);

    expect(removedColumn.isSelect).toBe(false);
    expect(removedColumn.isInsert).toBe(false);
    expect(removedColumn.isUpdate).toBe(false);

    expect(visibleColumn.isSelect).toBe(true);
    expect(visibleColumn.isInsert).toBe(true);
    expect(visibleColumn.isUpdate).toBe(true);

    expect(metadata.columns).toEqual([visibleColumn]);
  });

  it('refreshOnSchedule reconciles hidden columns once the migration is later reported completed, without recreating the adapter', async () => {
    const removedColumn = buildColumn('removedColumn');
    const visibleColumn = buildColumn('visibleColumn');

    const metadata = {
      target: EntityWithHideableColumns,
      tableName: 'entityWithHideableColumns',
      tablePath: 'core.entityWithHideableColumns',
      givenTableName: 'entityWithHideableColumns',
      schema: 'core',
      columns: [removedColumn, visibleColumn],
    } as unknown as EntityMetadata;

    const dataSource = {
      entityMetadatas: [metadata],
    } as unknown as DataSource;

    const getLastAttemptedInstanceCommand = jest
      .fn()
      .mockResolvedValueOnce(null);

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpgradeAwareEntityMetadataAdapter,
        {
          provide: UpgradeMigrationService,
          useValue: { getLastAttemptedInstanceCommand },
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: {
            getUpgradeSequence: jest
              .fn()
              .mockReturnValue([
                { name: REMOVE_STEP },
                { name: INTRODUCE_STEP },
              ]),
          },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    const adapter = moduleRef.get(UpgradeAwareEntityMetadataAdapter);

    // Simulates a pod that booted before the drop-column migration completed
    // elsewhere: the column is still reported as selectable.
    await adapter.onModuleInit();

    expect(removedColumn.isSelect).toBe(true);

    // The migration completes on another process; this pod is never restarted.
    getLastAttemptedInstanceCommand.mockResolvedValue({
      name: REMOVE_STEP,
      status: 'completed',
    });

    await adapter.refreshOnSchedule();

    expect(removedColumn.isSelect).toBe(false);
    expect(visibleColumn.isSelect).toBe(true);
  });

  it('refreshOnSchedule swallows refresh failures instead of throwing', async () => {
    const dataSource = {
      entityMetadatas: [],
    } as unknown as DataSource;

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpgradeAwareEntityMetadataAdapter,
        {
          provide: UpgradeMigrationService,
          useValue: {
            getLastAttemptedInstanceCommand: jest
              .fn()
              .mockRejectedValue(
                new Error('core.upgradeMigration unreachable'),
              ),
          },
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: {
            getUpgradeSequence: jest.fn().mockReturnValue([]),
          },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    const adapter = moduleRef.get(UpgradeAwareEntityMetadataAdapter);

    await adapter.onModuleInit();

    await expect(adapter.refreshOnSchedule()).resolves.toBeUndefined();

    adapter.onModuleDestroy();
  });

  it('refreshOnSchedule skips a run while a previous refresh is still in flight', async () => {
    const dataSource = {
      entityMetadatas: [],
    } as unknown as DataSource;

    let releaseInFlightRead!: () => void;
    const getLastAttemptedInstanceCommand = jest
      .fn()
      .mockResolvedValueOnce(null);

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpgradeAwareEntityMetadataAdapter,
        {
          provide: UpgradeMigrationService,
          useValue: { getLastAttemptedInstanceCommand },
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: {
            getUpgradeSequence: jest.fn().mockReturnValue([]),
          },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    const adapter = moduleRef.get(UpgradeAwareEntityMetadataAdapter);

    await adapter.onModuleInit();

    getLastAttemptedInstanceCommand.mockClear();
    getLastAttemptedInstanceCommand.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          releaseInFlightRead = () => resolve(null);
        }),
    );

    const firstRun = adapter.refreshOnSchedule();
    const secondRun = adapter.refreshOnSchedule();

    await flushMicrotasks();

    expect(getLastAttemptedInstanceCommand).toHaveBeenCalledTimes(1);

    releaseInFlightRead();
    await Promise.all([firstRun, secondRun]);

    adapter.onModuleDestroy();
  });

  it('serializes concurrent refresh calls so a slow stale read cannot roll the cursor backwards', async () => {
    const removedColumn = buildColumn('removedColumn');
    const visibleColumn = buildColumn('visibleColumn');

    const metadata = {
      target: EntityWithHideableColumns,
      tableName: 'entityWithHideableColumns',
      tablePath: 'core.entityWithHideableColumns',
      givenTableName: 'entityWithHideableColumns',
      schema: 'core',
      columns: [removedColumn, visibleColumn],
    } as unknown as EntityMetadata;

    const dataSource = {
      entityMetadatas: [metadata],
    } as unknown as DataSource;

    let releaseStaleRead!: () => void;
    const getLastAttemptedInstanceCommand = jest
      .fn()
      .mockResolvedValueOnce(null);

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpgradeAwareEntityMetadataAdapter,
        {
          provide: UpgradeMigrationService,
          useValue: { getLastAttemptedInstanceCommand },
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: {
            getUpgradeSequence: jest
              .fn()
              .mockReturnValue([
                { name: REMOVE_STEP },
                { name: INTRODUCE_STEP },
              ]),
          },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    const adapter = moduleRef.get(UpgradeAwareEntityMetadataAdapter);

    await adapter.onModuleInit();

    // First refresh hangs on a stale read (migration not completed yet),
    // second refresh reads the completed migration.
    getLastAttemptedInstanceCommand.mockClear();
    getLastAttemptedInstanceCommand.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          releaseStaleRead = () => resolve(null);
        }),
    );
    getLastAttemptedInstanceCommand.mockResolvedValue({
      name: REMOVE_STEP,
      status: 'completed',
    });

    const staleRefresh = adapter.refresh();
    const freshRefresh = adapter.refresh();

    await flushMicrotasks();

    // The second read must not start until the first one has finished.
    expect(getLastAttemptedInstanceCommand).toHaveBeenCalledTimes(1);

    releaseStaleRead();
    await Promise.all([staleRefresh, freshRefresh]);

    expect(getLastAttemptedInstanceCommand).toHaveBeenCalledTimes(2);
    expect(removedColumn.isSelect).toBe(false);

    adapter.onModuleDestroy();
  });

  it('refreshes on an interval after boot and stops after onModuleDestroy', async () => {
    jest.useFakeTimers();

    try {
      const dataSource = {
        entityMetadatas: [],
      } as unknown as DataSource;

      const getLastAttemptedInstanceCommand = jest.fn().mockResolvedValue(null);

      const moduleRef = await Test.createTestingModule({
        providers: [
          UpgradeAwareEntityMetadataAdapter,
          {
            provide: UpgradeMigrationService,
            useValue: { getLastAttemptedInstanceCommand },
          },
          {
            provide: UpgradeSequenceReaderService,
            useValue: {
              getUpgradeSequence: jest.fn().mockReturnValue([]),
            },
          },
          { provide: getDataSourceToken(), useValue: dataSource },
        ],
      }).compile();

      const adapter = moduleRef.get(UpgradeAwareEntityMetadataAdapter);

      await adapter.onModuleInit();

      getLastAttemptedInstanceCommand.mockClear();

      jest.advanceTimersByTime(UPGRADE_METADATA_REFRESH_INTERVAL_MS);
      await flushMicrotasks();

      expect(getLastAttemptedInstanceCommand).toHaveBeenCalledTimes(1);

      adapter.onModuleDestroy();
      getLastAttemptedInstanceCommand.mockClear();

      jest.advanceTimersByTime(UPGRADE_METADATA_REFRESH_INTERVAL_MS * 3);

      expect(getLastAttemptedInstanceCommand).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
