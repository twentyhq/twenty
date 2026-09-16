import { Test } from '@nestjs/testing';

import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { WorkspaceDataSourceService } from 'src/engine/twenty-orm/datasource/workspace-data-source.service';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

describe('WorkspaceOrmManager', () => {
  let workspaceOrmManager: WorkspaceOrmManager;
  const workspaceCacheService = { getOrRecompute: jest.fn() };
  const billingEntitlements = {
    [BillingEntitlementKey.USAGE_LIMIT]: true,
    [BillingEntitlementKey.RLS]: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      billingEntitlements,
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
    });

    const module = await Test.createTestingModule({
      providers: [
        WorkspaceOrmManager,
        {
          provide: RecordSharingFeatureService,
          useValue: {
            isRecordSharingEnabled: jest.fn().mockResolvedValue(true),
          },
        },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        { provide: WorkspaceDataSourceService, useValue: {} },
      ],
    }).compile();

    workspaceOrmManager = module.get(WorkspaceOrmManager);
  });

  it.each([false, true])(
    'loads entitlements with the other context data (lite: %s)',
    async (lite) => {
      const authContext = buildSystemAuthContext(WORKSPACE_ID);

      await workspaceOrmManager.executeInWorkspaceContext(
        () => {
          expect(getWorkspaceContext().authContext).toBe(authContext);
          expect(getWorkspaceContext().isRecordSharingEnabled).toBe(!lite);
          expect(getWorkspaceContext().billingEntitlements).toBe(
            billingEntitlements,
          );
        },
        authContext,
        { lite },
      );

      expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledTimes(1);
      expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.arrayContaining([
          'flatObjectMetadataMaps',
          'billingEntitlements',
        ]),
      );
    },
  );
});
