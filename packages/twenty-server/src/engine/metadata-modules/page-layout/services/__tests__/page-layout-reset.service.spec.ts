import { Test } from '@nestjs/testing';

import { PageLayoutType } from 'twenty-shared/types';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { PageLayoutResetService } from 'src/engine/metadata-modules/page-layout/services/page-layout-reset.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  'workspace-custom-application';

describe('PageLayoutResetService', () => {
  it.each([
    {
      source: 'standard layout',
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
      isSystemSideEffect: false,
    },
    {
      source: 'app-provided layout',
      applicationUniversalIdentifier: 'installed-application',
      isSystemSideEffect: false,
    },
    {
      source: 'generated layout for a custom object',
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      isSystemSideEffect: true,
    },
  ])(
    'restores the default pin state when resetting the $source',
    async ({ applicationUniversalIdentifier, isSystemSideEffect }) => {
      const layout: FlatPageLayout = {
        id: 'page-layout-id',
        universalIdentifier: 'page-layout-universal-identifier',
        applicationId: 'application-id',
        applicationUniversalIdentifier,
        workspaceId: 'workspace-id',
        name: 'Record page',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        objectMetadataUniversalIdentifier: null,
        defaultTabToFocusOnMobileAndSidePanelId: null,
        defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
        tabIds: [],
        tabUniversalIdentifiers: [],
        isSystemSideEffect,
        isFirstTabPinned: false,
        createdAt: '2026-08-27T00:00:00.000Z',
        updatedAt: '2026-08-27T00:00:00.000Z',
        deletedAt: null,
      };
      const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

      allFlatEntityMaps.flatPageLayoutMaps =
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: layout,
          flatEntityMaps: allFlatEntityMaps.flatPageLayoutMaps,
        });

      const validateBuildAndRunWorkspaceMigration = jest
        .fn()
        .mockResolvedValue({ status: 'success' });
      const module = await Test.createTestingModule({
        providers: [
          PageLayoutResetService,
          {
            provide: WorkspaceMigrationValidateBuildAndRunService,
            useValue: { validateBuildAndRunWorkspaceMigration },
          },
          {
            provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
            useValue: {
              getOrRecomputeManyOrAllFlatEntityMaps: jest
                .fn()
                .mockResolvedValue(allFlatEntityMaps),
            },
          },
          {
            provide: ApplicationService,
            useValue: {
              findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
                .fn()
                .mockResolvedValue({
                  workspaceCustomFlatApplication: {
                    universalIdentifier:
                      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
                  },
                }),
            },
          },
          {
            provide: DashboardSyncService,
            useValue: {
              updateLinkedDashboardsUpdatedAtByPageLayoutId: jest.fn(),
            },
          },
          { provide: ViewService, useValue: {} },
        ],
      }).compile();
      const service = module.get(PageLayoutResetService);

      await service.resetPageLayoutToDefault({
        id: layout.id,
        workspaceId: layout.workspaceId,
      });

      expect(validateBuildAndRunWorkspaceMigration).toHaveBeenCalledWith(
        expect.objectContaining({
          allFlatEntityOperationByMetadataName: expect.objectContaining({
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [
                {
                  ...layout,
                  isFirstTabPinned: true,
                  updatedAt: expect.any(String),
                },
              ],
              flatEntityToDelete: [],
            },
          }),
        }),
      );

      await module.close();
    },
  );
});
