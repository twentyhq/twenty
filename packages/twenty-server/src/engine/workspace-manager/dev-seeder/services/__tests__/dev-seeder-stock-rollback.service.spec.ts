import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { DevSeederDataService } from 'src/engine/workspace-manager/dev-seeder/data/services/dev-seeder-data.service';
import { DevSeederService } from 'src/engine/workspace-manager/dev-seeder/services/dev-seeder.service';

jest.mock(
  'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspace.util',
  () => ({ createWorkspace: jest.fn() }),
);

jest.mock(
  'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflow-command-menu-items.util',
  () => ({ prefillWorkflowCommandMenuItems: jest.fn() }),
);
jest.mock(
  'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-front-component-command-menu-items.util',
  () => ({ prefillFrontComponentCommandMenuItems: jest.fn() }),
);

describe('Development seeding stock rollback', () => {
  it('invalidates stock after rolling back application creation', async () => {
    const failure = new Error('package file write failed');
    const queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };
    const createWorkspaceCustomApplication = jest
      .fn()
      .mockRejectedValue(failure);
    const invalidateStorageStock = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        DevSeederService,
        {
          provide: getDataSourceToken(),
          useValue: { createQueryRunner: () => queryRunner },
        },
        {
          provide: ApplicationService,
          useValue: { createWorkspaceCustomApplication },
        },
        { provide: FileStorageService, useValue: { invalidateStorageStock } },
        { provide: TwentyConfigService, useValue: { get: () => false } },
        {
          provide: UpgradeMigrationService,
          useValue: { getLastAttemptedInstanceCommandOrThrow: jest.fn() },
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: {
            getInitialCursorForNewWorkspace: () => ({
              name: 'initial',
              status: 'success',
            }),
          },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    await expect(
      module.get(DevSeederService).seedDev(SEED_APPLE_WORKSPACE_ID),
    ).rejects.toBe(failure);

    const [scope] = createWorkspaceCustomApplication.mock.calls[0];
    expect(invalidateStorageStock).toHaveBeenCalledWith(scope);
    expect(
      queryRunner.rollbackTransaction.mock.invocationCallOrder[0],
    ).toBeLessThan(invalidateStorageStock.mock.invocationCallOrder[0]);
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it.each([false, true])(
    'invalidates rolled-back attachment stock only for full seeding; light: %s',
    async (light) => {
      const failure = new Error('attachment transaction failed');
      const transaction = jest.fn().mockRejectedValue(failure);
      const invalidateStorageStock = jest.fn();
      const module = await Test.createTestingModule({
        providers: [
          DevSeederDataService,
          { provide: getDataSourceToken(), useValue: { transaction } },
          {
            provide: ApplicationService,
            useValue: {
              findByUniversalIdentifier: async () => ({
                id: 'standard-application',
              }),
            },
          },
          { provide: FileStorageService, useValue: { invalidateStorageStock } },
          {
            provide: ObjectMetadataService,
            useValue: { findManyWithinWorkspace: async () => [] },
          },
          {
            provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
            useValue: {
              getOrRecomputeManyOrAllFlatEntityMaps: async () => ({}),
            },
          },
        ],
      })
        .useMocker(() => ({}))
        .compile();

      await expect(
        module
          .get(DevSeederDataService)
          .seed({
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            schemaName: 'workspace',
            light,
          }),
      ).rejects.toBe(failure);

      if (light) {
        expect(invalidateStorageStock).not.toHaveBeenCalled();
      } else {
        expect(invalidateStorageStock).toHaveBeenCalledWith({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: 'standard-application',
        });
      }
    },
  );
});
