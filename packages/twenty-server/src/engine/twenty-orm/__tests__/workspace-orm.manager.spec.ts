import { Test } from '@nestjs/testing';

import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceDataSourceService } from 'src/engine/twenty-orm/datasource/workspace-data-source.service';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('workspace context sharing enforcement', () => {
  it.each([true, false])(
    'uses the same rollout decision (%s) in lite and full contexts',
    async (isLegacyRecordAccessOpen) => {
      const module = await Test.createTestingModule({
        providers: [
          WorkspaceOrmManager,
          { provide: WorkspaceDataSourceService, useValue: {} },
          {
            provide: WorkspaceCacheService,
            useValue: {
              getOrRecompute: jest.fn().mockResolvedValue({
                flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
              }),
            },
          },
          {
            provide: RecordSharingFeatureService,
            useValue: {
              isLegacyRecordAccessOpen: jest
                .fn()
                .mockResolvedValue(isLegacyRecordAccessOpen),
            },
          },
        ],
      }).compile();
      const manager = module.get(WorkspaceOrmManager);
      const authContext = buildSystemAuthContext('workspace');
      for (const lite of [true, false]) {
        const decision = await manager.executeInWorkspaceContext(
          () => getWorkspaceContext().isLegacyRecordAccessOpen,
          authContext,
          { lite },
        );
        expect(decision).toBe(isLegacyRecordAccessOpen);
      }
      await module.close();
    },
  );
});
