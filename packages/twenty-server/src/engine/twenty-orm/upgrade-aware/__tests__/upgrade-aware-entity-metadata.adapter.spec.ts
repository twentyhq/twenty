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
            getCompletedInstanceCommandNames: jest.fn().mockResolvedValue([]),
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
            getCompletedInstanceCommandNames: jest
              .fn()
              .mockResolvedValue([REMOVE_STEP]),
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

  it('keeps the cursor at the highest completed step when lower steps are completed later', async () => {
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
            getCompletedInstanceCommandNames: jest
              .fn()
              .mockResolvedValue([RENAME_STEP, REMOVE_STEP]),
          },
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: {
            getUpgradeSequence: jest.fn().mockReturnValue([
              { name: RENAME_STEP },
              { name: INTRODUCE_STEP },
              { name: REMOVE_STEP },
            ]),
          },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    const adapter = moduleRef.get(UpgradeAwareEntityMetadataAdapter);

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(introducedColumn.isSelect).toBe(true);
    expect(introducedColumn.isInsert).toBe(true);
    expect(introducedColumn.isUpdate).toBe(true);

    expect(removedColumn.isSelect).toBe(false);
    expect(removedColumn.isInsert).toBe(false);
    expect(removedColumn.isUpdate).toBe(false);

    expect(metadata.columns).toEqual([introducedColumn, visibleColumn]);
  });
});
