import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { type DataSource } from 'typeorm';
import { type EntityMetadata } from 'typeorm/metadata/EntityMetadata';

import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WasRenamedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeAwareEntityMetadataService } from 'src/engine/twenty-orm/services/upgrade-aware-entity-metadata.service';

const RENAME_CMD = '2.6.0_RenameCommand_1700000000000';
const INTRODUCE_CMD = '2.7.0_IntroduceCommand_1800000000000';
const PROP_INTRODUCE_CMD = '2.7.0_AddColumn_1800000000001';

const SEQUENCE_NAMES = [RENAME_CMD, INTRODUCE_CMD, PROP_INTRODUCE_CMD];

@WasRenamedInUpgrade([
  { previousName: 'oldEntity', upgradeCommandName: RENAME_CMD },
])
class RenamedEntity {
  id!: string;
  name!: string;
}

@WasIntroducedInUpgrade({ upgradeCommandName: INTRODUCE_CMD })
class IntroducedEntity {
  id!: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @WasIntroducedInUpgrade({ upgradeCommandName: PROP_INTRODUCE_CMD })
  brandNewColumn!: string;
}

class PlainEntity {
  id!: string;
}

const buildEntityMetadata = ({
  target,
  tableName,
  schema,
  columns,
}: {
  target: Function;
  tableName: string;
  schema?: string;
  columns: {
    propertyName: string;
    databaseName: string;
    isSelect?: boolean;
  }[];
}): EntityMetadata => {
  const columnMetadatas = columns.map((column) => ({
    propertyName: column.propertyName,
    databaseName: column.databaseName,
    isSelect: column.isSelect ?? true,
  }));

  return {
    target,
    tableName,
    tablePath: schema ? `${schema}.${tableName}` : tableName,
    givenTableName: tableName,
    schema,
    columns: columnMetadatas,
  } as unknown as EntityMetadata;
};

describe('UpgradeAwareEntityMetadataService', () => {
  const buildService = async ({
    entityMetadatas,
  }: {
    entityMetadatas: EntityMetadata[];
  }) => {
    let lastAttempted: { name: string; status: 'completed' | 'failed' } | null =
      null;

    const upgradeMigrationService = {
      getLastAttemptedInstanceCommand: jest
        .fn()
        .mockImplementation(async () => lastAttempted),
    };

    const upgradeSequenceReaderService = {
      getUpgradeSequence: jest
        .fn()
        .mockReturnValue(SEQUENCE_NAMES.map((name) => ({ name }))),
    };

    const dataSource = { entityMetadatas } as unknown as DataSource;

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpgradeAwareEntityMetadataService,
        {
          provide: UpgradeMigrationService,
          useValue: upgradeMigrationService,
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: upgradeSequenceReaderService,
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    const service = moduleRef.get(UpgradeAwareEntityMetadataService);

    service.onModuleInit();

    return {
      service,
      setLastAttempted: async (
        next: { name: string; status: 'completed' | 'failed' } | null,
      ) => {
        lastAttempted = next;
        await service.refresh();
      },
    };
  };

  it('should rewrite tableName, tablePath, givenTableName when a class rename has not been applied', async () => {
    const metadata = buildEntityMetadata({
      target: RenamedEntity,
      tableName: 'renamedEntity',
      schema: 'core',
      columns: [{ propertyName: 'id', databaseName: 'id' }],
    });

    const { setLastAttempted } = await buildService({
      entityMetadatas: [metadata],
    });

    await setLastAttempted(null);

    expect(metadata.tableName).toBe('oldEntity');
    expect(metadata.tablePath).toBe('core.oldEntity');
    expect(metadata.givenTableName).toBe('oldEntity');
  });

  it('should restore the canonical names once the rename step has been applied', async () => {
    const metadata = buildEntityMetadata({
      target: RenamedEntity,
      tableName: 'renamedEntity',
      schema: 'core',
      columns: [{ propertyName: 'id', databaseName: 'id' }],
    });

    const { setLastAttempted } = await buildService({
      entityMetadatas: [metadata],
    });

    await setLastAttempted({ name: RENAME_CMD, status: 'completed' });

    expect(metadata.tableName).toBe('renamedEntity');
    expect(metadata.tablePath).toBe('core.renamedEntity');
    expect(metadata.givenTableName).toBe('renamedEntity');
  });

  it('should leave undecorated entities untouched', async () => {
    const metadata = buildEntityMetadata({
      target: PlainEntity,
      tableName: 'plainEntity',
      schema: 'core',
      columns: [{ propertyName: 'id', databaseName: 'id' }],
    });

    const { setLastAttempted } = await buildService({
      entityMetadatas: [metadata],
    });

    await setLastAttempted(null);

    expect(metadata.tableName).toBe('plainEntity');
    expect(metadata.tablePath).toBe('core.plainEntity');
  });

  it('should expose entity availability and hidden columns through sidecar accessors', async () => {
    const metadata = buildEntityMetadata({
      target: IntroducedEntity,
      tableName: 'introducedEntity',
      schema: 'core',
      columns: [
        { propertyName: 'id', databaseName: 'id' },
        { propertyName: 'brandNewColumn', databaseName: 'brandNewColumn' },
      ],
    });

    const { service, setLastAttempted } = await buildService({
      entityMetadatas: [metadata],
    });

    await setLastAttempted(null);

    expect(service.isEntityAvailable(IntroducedEntity)).toBe(false);
    expect(service.getHiddenColumnPropertyNames(IntroducedEntity)).toEqual(
      new Set(['brandNewColumn']),
    );

    await setLastAttempted({ name: PROP_INTRODUCE_CMD, status: 'completed' });

    expect(service.isEntityAvailable(IntroducedEntity)).toBe(true);
    expect(service.getHiddenColumnPropertyNames(IntroducedEntity).size).toBe(
      0,
    );
  });

  it('should mutate column.isSelect for not-yet-introduced columns', async () => {
    const metadata = buildEntityMetadata({
      target: IntroducedEntity,
      tableName: 'introducedEntity',
      schema: 'core',
      columns: [
        { propertyName: 'id', databaseName: 'id', isSelect: true },
        {
          propertyName: 'brandNewColumn',
          databaseName: 'brandNewColumn',
          isSelect: true,
        },
      ],
    });

    const { setLastAttempted } = await buildService({
      entityMetadatas: [metadata],
    });

    await setLastAttempted({ name: INTRODUCE_CMD, status: 'completed' });

    const brandNewColumn = metadata.columns.find(
      (column) => column.propertyName === 'brandNewColumn',
    );

    expect(brandNewColumn?.isSelect).toBe(false);

    await setLastAttempted({ name: PROP_INTRODUCE_CMD, status: 'completed' });

    expect(brandNewColumn?.isSelect).toBe(true);
  });
});
