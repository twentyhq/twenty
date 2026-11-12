import { Test } from '@nestjs/testing';

import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
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
            provide: PrincipalPermissionsReadService,
            useValue: {
              resolvePermissionsPrincipals: jest
                .fn()
                .mockResolvedValue(undefined),
            },
          },
          { provide: RecordPermissionsReadService, useValue: {} },
          {
            provide: EnterprisePlanService,
            useValue: { isValid: jest.fn().mockReturnValue(false) },
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
                flatRowLevelPermissionPredicateMaps:
                  createEmptyFlatEntityMaps(),
                featureFlagsMap: {},
                billingEntitlements: {},
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
