import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
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
      const findActiveRevision = jest.fn().mockResolvedValue(null);
      const module = await Test.createTestingModule({
        providers: [
          WorkspaceOrmManager,
          {
            provide: DataSource,
            useValue: {
              getRepository: () => ({ findOneBy: findActiveRevision }),
            },
          },
          { provide: WorkspaceDataSourceService, useValue: {} },
          {
            provide: EnterprisePlanService,
            useValue: { isValid: jest.fn().mockReturnValue(true) },
          },
          {
            provide: TwentyConfigService,
            useValue: { get: jest.fn().mockReturnValue(false) },
          },
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
      expect(findActiveRevision).toHaveBeenCalledWith({
        workspaceId: 'workspace',
        status: 'active',
      });
      expect(
        module.get(WorkspaceCacheService).getOrRecompute,
      ).toHaveBeenCalledTimes(1);
      findActiveRevision.mockClear();
      await manager.executeInWorkspaceContext(
        async () => {
          const pinned = getWorkspaceContext();
          const nested = await manager.executeInWorkspaceContext(
            () => getWorkspaceContext(),
            authContext,
          );
          expect(nested).toBe(pinned);
          const otherAuthContext = buildSystemAuthContext('another-workspace');
          const other = await manager.executeInWorkspaceContext(
            () => getWorkspaceContext(),
            otherAuthContext,
          );
          expect(other.authContext).toBe(otherAuthContext);
          expect(getWorkspaceContext()).toBe(pinned);
        },
        authContext,
        { reuseContextForNestedReads: true },
      );
      expect(findActiveRevision).toHaveBeenCalledTimes(2);
      await manager.executeInWorkspaceContext(
        () => getWorkspaceContext(),
        authContext,
      );
      expect(findActiveRevision).toHaveBeenCalledTimes(3);
      await module.close();
    },
  );
});
