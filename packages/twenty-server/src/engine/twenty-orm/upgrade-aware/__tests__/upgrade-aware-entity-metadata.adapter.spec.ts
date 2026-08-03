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
import { type UpgradeMigrationStatus } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { UpgradeAwareEntityMetadataAdapter } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-entity-metadata.adapter';

const RENAME_STEP = '2.6.0_Rename_1700000000000';
const INTRODUCE_STEP = '2.7.0_AddColumn_1800000000000';
const REMOVE_STEP = '2.7.0_DropColumn_1800000000001';

const EARLY_STEP = '2.6.0_Early_1700000000001';
const SLOW_STEP = '2.6.0_Backfill_1700000000002';
const WORKSPACE_STEP = '2.6.0_WorkspaceThing_1700000000003';
const COLUMN_RENAME_STEP = '2.6.0_RenameColumn_1700000000004';
const CLASS_INTRODUCE_STEP = '2.6.0_AddEntity_1700000000005';

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

class EntityWithIntroducedColumn {
  @WasIntroducedInUpgrade({ upgradeCommandName: INTRODUCE_STEP })
  introducedColumn!: string;

  visibleColumn!: string;
}

class EntityWithRenamedColumn {
  @WasRenamedInUpgrade([
    { previousName: 'oldColumn', upgradeCommandName: COLUMN_RENAME_STEP },
  ])
  newColumn!: string;
}

@WasIntroducedInUpgrade({ upgradeCommandName: CLASS_INTRODUCE_STEP })
class LateEntity {}

const buildColumn = (propertyName: string): ColumnMetadata =>
  ({
    propertyName,
    databaseName: propertyName,
    isSelect: true,
    isInsert: true,
    isUpdate: true,
  }) as unknown as ColumnMetadata;

const buildAdapter = async ({
  metadata,
  sequence,
  statuses,
  databaseColumns = [],
}: {
  metadata: EntityMetadata;
  sequence: { name: string; kind?: string }[];
  statuses: [string, UpgradeMigrationStatus][];
  databaseColumns?: {
    table_schema: string;
    table_name: string;
    column_name: string;
  }[];
}): Promise<UpgradeAwareEntityMetadataAdapter> => {
  const dataSource = {
    entityMetadatas: [metadata],
    query: jest.fn().mockResolvedValue(databaseColumns),
  } as unknown as DataSource;

  const moduleRef = await Test.createTestingModule({
    providers: [
      UpgradeAwareEntityMetadataAdapter,
      {
        provide: UpgradeMigrationService,
        useValue: {
          getLatestInstanceCommandStatuses: jest
            .fn()
            .mockResolvedValue(new Map(statuses)),
        },
      },
      {
        provide: UpgradeSequenceReaderService,
        useValue: {
          getUpgradeSequence: jest.fn().mockReturnValue(sequence),
        },
      },
      { provide: getDataSourceToken(), useValue: dataSource },
    ],
  }).compile();

  return moduleRef.get(UpgradeAwareEntityMetadataAdapter);
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

    const adapter = await buildAdapter({
      metadata,
      sequence: [{ name: RENAME_STEP }],
      statuses: [],
    });

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

    const adapter = await buildAdapter({
      metadata,
      sequence: [{ name: REMOVE_STEP }, { name: INTRODUCE_STEP }],
      statuses: [[REMOVE_STEP, 'completed']],
    });

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

  // Regression: a slow instance command running long after the fast commands
  // that follow it in the sequence used to drag the cursor backwards, hiding
  // columns whose introduction had already been applied.
  it('keeps every completed instance step applied regardless of the order the commands ran in', async () => {
    const introducedColumn = buildColumn('introducedColumn');
    const visibleColumn = buildColumn('visibleColumn');

    const metadata = {
      target: EntityWithIntroducedColumn,
      tableName: 'entityWithIntroducedColumn',
      tablePath: 'core.entityWithIntroducedColumn',
      givenTableName: 'entityWithIntroducedColumn',
      schema: 'core',
      columns: [introducedColumn, visibleColumn],
    } as unknown as EntityMetadata;

    const adapter = await buildAdapter({
      metadata,
      sequence: [
        { name: EARLY_STEP },
        { name: INTRODUCE_STEP },
        { name: SLOW_STEP },
      ],
      statuses: [
        [EARLY_STEP, 'completed'],
        [INTRODUCE_STEP, 'completed'],
        [SLOW_STEP, 'completed'],
      ],
    });

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(introducedColumn.isSelect).toBe(true);
    expect(metadata.columns).toEqual([introducedColumn, visibleColumn]);
  });

  it('stops the cursor at the first instance step that has not completed', async () => {
    const introducedColumn = buildColumn('introducedColumn');
    const visibleColumn = buildColumn('visibleColumn');

    const metadata = {
      target: EntityWithIntroducedColumn,
      tableName: 'entityWithIntroducedColumn',
      tablePath: 'core.entityWithIntroducedColumn',
      givenTableName: 'entityWithIntroducedColumn',
      schema: 'core',
      columns: [introducedColumn, visibleColumn],
    } as unknown as EntityMetadata;

    const adapter = await buildAdapter({
      metadata,
      sequence: [{ name: EARLY_STEP }, { name: INTRODUCE_STEP }],
      statuses: [
        [EARLY_STEP, 'failed'],
        [INTRODUCE_STEP, 'completed'],
      ],
    });

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(introducedColumn.isSelect).toBe(false);
    expect(metadata.columns).toEqual([visibleColumn]);
  });

  it('does not let workspace steps hold the cursor back', async () => {
    const introducedColumn = buildColumn('introducedColumn');
    const visibleColumn = buildColumn('visibleColumn');

    const metadata = {
      target: EntityWithIntroducedColumn,
      tableName: 'entityWithIntroducedColumn',
      tablePath: 'core.entityWithIntroducedColumn',
      givenTableName: 'entityWithIntroducedColumn',
      schema: 'core',
      columns: [introducedColumn, visibleColumn],
    } as unknown as EntityMetadata;

    const adapter = await buildAdapter({
      metadata,
      sequence: [
        { name: EARLY_STEP },
        { name: WORKSPACE_STEP, kind: 'workspace' },
        { name: INTRODUCE_STEP },
      ],
      statuses: [
        [EARLY_STEP, 'completed'],
        [INTRODUCE_STEP, 'completed'],
      ],
    });

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(introducedColumn.isSelect).toBe(true);
    expect(metadata.columns).toEqual([introducedColumn, visibleColumn]);
  });

  // Production hit this exact shape: a missing slow instance command stalled
  // the cursor before a rename that had in fact been applied, so the adapter
  // would have pointed every query at a column the database no longer had.
  it('does not rename a column back when only the new name exists in the database', async () => {
    const renamedColumn = buildColumn('newColumn');

    const metadata = {
      target: EntityWithRenamedColumn,
      tableName: 'entityWithRenamedColumn',
      tablePath: 'core.entityWithRenamedColumn',
      givenTableName: 'entityWithRenamedColumn',
      schema: 'core',
      columns: [renamedColumn],
    } as unknown as EntityMetadata;

    const adapter = await buildAdapter({
      metadata,
      sequence: [{ name: EARLY_STEP }, { name: COLUMN_RENAME_STEP }],
      statuses: [],
      databaseColumns: [
        {
          table_schema: 'core',
          table_name: 'entityWithRenamedColumn',
          column_name: 'newColumn',
        },
      ],
    });

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(renamedColumn.databaseName).toBe('newColumn');
  });

  it('still renames a column back when the old name is what the database has', async () => {
    const renamedColumn = buildColumn('newColumn');

    const metadata = {
      target: EntityWithRenamedColumn,
      tableName: 'entityWithRenamedColumn',
      tablePath: 'core.entityWithRenamedColumn',
      givenTableName: 'entityWithRenamedColumn',
      schema: 'core',
      columns: [renamedColumn],
    } as unknown as EntityMetadata;

    const adapter = await buildAdapter({
      metadata,
      sequence: [{ name: EARLY_STEP }, { name: COLUMN_RENAME_STEP }],
      statuses: [],
      databaseColumns: [
        {
          table_schema: 'core',
          table_name: 'entityWithRenamedColumn',
          column_name: 'oldColumn',
        },
      ],
    });

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(renamedColumn.databaseName).toBe('oldColumn');
  });

  it('does not rename a table back when only the new table exists in the database', async () => {
    const metadata = {
      target: RenamedEntity,
      tableName: 'newEntity',
      tablePath: 'core.newEntity',
      givenTableName: 'newEntity',
      schema: 'core',
      columns: [],
    } as unknown as EntityMetadata;

    const adapter = await buildAdapter({
      metadata,
      sequence: [{ name: RENAME_STEP }],
      statuses: [],
      databaseColumns: [
        {
          table_schema: 'core',
          table_name: 'newEntity',
          column_name: 'id',
        },
      ],
    });

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(metadata.tableName).toBe('newEntity');
    expect(metadata.tablePath).toBe('core.newEntity');
  });

  it('keeps an entity available when its table exists in the database', async () => {
    const metadata = {
      target: LateEntity,
      tableName: 'lateEntity',
      tablePath: 'core.lateEntity',
      givenTableName: 'lateEntity',
      schema: 'core',
      columns: [],
    } as unknown as EntityMetadata;

    const adapter = await buildAdapter({
      metadata,
      sequence: [{ name: EARLY_STEP }, { name: CLASS_INTRODUCE_STEP }],
      statuses: [],
      databaseColumns: [
        {
          table_schema: 'core',
          table_name: 'lateEntity',
          column_name: 'id',
        },
      ],
    });

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(adapter.isEntityAvailable(LateEntity)).toBe(true);
  });

  it('leaves an entity unavailable when its table is genuinely absent', async () => {
    const metadata = {
      target: LateEntity,
      tableName: 'lateEntity',
      tablePath: 'core.lateEntity',
      givenTableName: 'lateEntity',
      schema: 'core',
      columns: [],
    } as unknown as EntityMetadata;

    const adapter = await buildAdapter({
      metadata,
      sequence: [{ name: EARLY_STEP }, { name: CLASS_INTRODUCE_STEP }],
      statuses: [],
      databaseColumns: [
        {
          table_schema: 'core',
          table_name: 'someOtherTable',
          column_name: 'id',
        },
      ],
    });

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(adapter.isEntityAvailable(LateEntity)).toBe(false);
  });

  // Safety net: whatever the cursor believes, a column that is physically in
  // the database must stay visible, otherwise every query naming it fails.
  it('never hides a column that exists in the database', async () => {
    const introducedColumn = buildColumn('introducedColumn');
    const visibleColumn = buildColumn('visibleColumn');

    const metadata = {
      target: EntityWithIntroducedColumn,
      tableName: 'entityWithIntroducedColumn',
      tablePath: 'core.entityWithIntroducedColumn',
      givenTableName: 'entityWithIntroducedColumn',
      schema: 'core',
      columns: [introducedColumn, visibleColumn],
    } as unknown as EntityMetadata;

    const adapter = await buildAdapter({
      metadata,
      sequence: [{ name: EARLY_STEP }, { name: INTRODUCE_STEP }],
      statuses: [[EARLY_STEP, 'failed']],
      databaseColumns: [
        {
          table_schema: 'core',
          table_name: 'entityWithIntroducedColumn',
          column_name: 'introducedColumn',
        },
      ],
    });

    await adapter.onModuleInit();

    await adapter.refresh();

    expect(introducedColumn.isSelect).toBe(true);
    expect(metadata.columns).toEqual([introducedColumn, visibleColumn]);
  });
});
