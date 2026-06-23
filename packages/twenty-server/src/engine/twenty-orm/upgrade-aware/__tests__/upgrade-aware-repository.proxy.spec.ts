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

  describe('hidden column stripping from select', () => {
    class AvailableEntity {}

    const buildState = (hiddenColumns: string[]): UpgradeAwareRepositoryState =>
      ({
        isEntityAvailable: () => true,
        getHiddenColumnPropertyNames: () => new Set(hiddenColumns),
      }) as unknown as UpgradeAwareRepositoryState;

    const buildWrappedRepository = (state: UpgradeAwareRepositoryState) => {
      const find = jest.fn().mockResolvedValue([]);
      const repository = {
        find,
        metadata: { relations: [], targetName: 'AvailableEntity' },
      } as unknown as Repository<AvailableEntity>;

      const wrapped = wrapRepositoryWithUpgradeAwareProxy({
        repository,
        entityClass: AvailableEntity,
        state,
      });

      return { find, wrapped };
    };

    it('removes a hidden column from a select array', async () => {
      const { find, wrapped } = buildWrappedRepository(
        buildState(['universalIdentifier']),
      );

      await wrapped.find({
        select: ['id', 'universalIdentifier', 'objectMetadataId'],
        where: { objectMetadataId: 'x' },
      } as Parameters<typeof wrapped.find>[0]);

      expect(find).toHaveBeenCalledWith({
        select: ['id', 'objectMetadataId'],
        where: { objectMetadataId: 'x' },
      });
    });

    it('drops the select key entirely when every selected column is hidden', async () => {
      const { find, wrapped } = buildWrappedRepository(
        buildState(['universalIdentifier']),
      );

      await wrapped.find({
        select: ['universalIdentifier'],
        where: { objectMetadataId: 'x' },
      } as Parameters<typeof wrapped.find>[0]);

      expect(find).toHaveBeenCalledWith({ where: { objectMetadataId: 'x' } });
    });

    it('leaves the select untouched when no selected column is hidden', async () => {
      const { find, wrapped } = buildWrappedRepository(buildState([]));

      await wrapped.find({
        select: ['id', 'objectMetadataId'],
      } as Parameters<typeof wrapped.find>[0]);

      expect(find).toHaveBeenCalledWith({ select: ['id', 'objectMetadataId'] });
    });
  });
});
