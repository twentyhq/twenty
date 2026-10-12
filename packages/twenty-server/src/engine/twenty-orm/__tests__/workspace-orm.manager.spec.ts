import { Test } from '@nestjs/testing';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceDataSourceService } from 'src/engine/twenty-orm/datasource/workspace-data-source.service';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('workspace context sharing enforcement', () => {
  it.each([true, false])(
    'loads the authenticated workspace without a sharing rollout lookup (lite=%s)',
    async (lite) => {
      const module = await Test.createTestingModule({
        providers: [
          WorkspaceOrmManager,
          { provide: WorkspaceDataSourceService, useValue: {} },
          {
            provide: WorkspaceCacheService,
            useValue: {
              getOrRecompute: jest.fn().mockResolvedValue({
                flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
                featureFlagsMap: {},
              }),
            },
          },
        ],
      }).compile();
      const manager = module.get(WorkspaceOrmManager);
      const authContext = buildSystemAuthContext('workspace');
      const context = await manager.executeInWorkspaceContext(
        () => getWorkspaceContext(),
        authContext,
        { lite },
      );
      expect(context.authContext).toBe(authContext);
      expect(
        module.get(WorkspaceCacheService).getOrRecompute,
      ).toHaveBeenCalledTimes(1);
      await module.close();
    },
  );
});
