import 'reflect-metadata';

import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { type DataSource, type Repository } from 'typeorm';
import { type EntityMetadata } from 'typeorm/metadata/EntityMetadata';

import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeAwareEntityMetadataAdapter } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-entity-metadata.adapter';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';
import { wrapRepositoryWithUpgradeAwareProxy } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository.proxy';

const INTRODUCE_STEP = '2.7.0_Introduce_1800000000000';

@WasIntroducedInUpgrade({ upgradeCommandName: INTRODUCE_STEP })
class UnavailableEntity {}

class EntityWithHiddenColumn {}

describe('wrapRepositoryWithUpgradeAwareProxy', () => {
  it('short-circuits find() to an empty array when the entity is unavailable', async () => {
    const metadata = {
      target: UnavailableEntity,
      tableName: 'unavailableEntity',
      tablePath: 'core.unavailableEntity',
      givenTableName: 'unavailableEntity',
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
              .mockReturnValue([{ name: INTRODUCE_STEP }]),
          },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    const adapter = moduleRef.get(UpgradeAwareEntityMetadataAdapter);

    await adapter.onModuleInit();
    await adapter.refresh();

    const find = jest.fn().mockResolvedValue([{ id: 1 }]);
    const repository = { find } as unknown as Repository<UnavailableEntity>;

    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: UnavailableEntity,
      state: UpgradeAwareRepositoryState.getInstance(),
    });

    await expect(wrapped.find()).resolves.toEqual([]);
    expect(find).not.toHaveBeenCalled();
  });

  it('strips hidden columns from an array select while preserving unknown keys', async () => {
    const find = jest.fn().mockResolvedValue([]);
    const repository = {
      find,
      metadata: {
        relations: [],
        targetName: EntityWithHiddenColumn.name,
      },
    } as unknown as Repository<EntityWithHiddenColumn>;
    const state = {
      getHiddenColumnPropertyNames: jest
        .fn()
        .mockReturnValue(new Set(['introducedColumn'])),
      isEntityAvailable: jest.fn().mockReturnValue(true),
    } as unknown as UpgradeAwareRepositoryState;
    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: EntityWithHiddenColumn,
      state,
    });

    await (
      wrapped.find as unknown as (options: {
        select: string[];
      }) => Promise<unknown>
    )({
      select: ['id', 'introducedColumn', 'unknownTypo'],
    });

    expect(find).toHaveBeenCalledWith({
      select: ['id', 'unknownTypo'],
    });
  });

  it('strips hidden columns from an object select while preserving unknown keys', async () => {
    const find = jest.fn().mockResolvedValue([]);
    const repository = {
      find,
      metadata: {
        relations: [],
        targetName: EntityWithHiddenColumn.name,
      },
    } as unknown as Repository<EntityWithHiddenColumn>;
    const state = {
      getHiddenColumnPropertyNames: jest
        .fn()
        .mockReturnValue(new Set(['introducedColumn'])),
      isEntityAvailable: jest.fn().mockReturnValue(true),
    } as unknown as UpgradeAwareRepositoryState;
    const wrapped = wrapRepositoryWithUpgradeAwareProxy({
      repository,
      entityClass: EntityWithHiddenColumn,
      state,
    });

    await (
      wrapped.find as unknown as (options: {
        select: Record<string, boolean>;
      }) => Promise<unknown>
    )({
      select: {
        id: true,
        introducedColumn: true,
        unknownTypo: true,
      },
    });

    expect(find).toHaveBeenCalledWith({
      select: {
        id: true,
        unknownTypo: true,
      },
    });
  });
});
