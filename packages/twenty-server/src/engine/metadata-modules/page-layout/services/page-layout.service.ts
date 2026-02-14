import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { fromCreatePageLayoutInputToFlatPageLayoutToCreate } from 'src/engine/metadata-modules/flat-page-layout/utils/from-create-page-layout-input-to-flat-page-layout-to-create.util';
import { fromDestroyPageLayoutInputToFlatPageLayoutOrThrow } from 'src/engine/metadata-modules/flat-page-layout/utils/from-destroy-page-layout-input-to-flat-page-layout-or-throw.util';
import {
  fromUpdatePageLayoutInputToFlatPageLayoutToUpdateOrThrow,
  type UpdatePageLayoutInputWithId,
} from 'src/engine/metadata-modules/flat-page-layout/utils/from-update-page-layout-input-to-flat-page-layout-to-update-or-throw.util';
import { reconstructFlatPageLayoutWithTabsAndWidgets } from 'src/engine/metadata-modules/flat-page-layout/utils/reconstruct-flat-page-layout-with-tabs-and-widgets.util';
import { CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { fromFlatPageLayoutToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-to-page-layout-dto.util';
import { fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-with-tabs-and-widgets-to-page-layout-dto.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';

@Injectable()
export class PageLayoutService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly dashboardSyncService: DashboardSyncService,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<PageLayoutDTO[]> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const activeLayouts = Object.values(
      flatPageLayoutMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((layout) => !isDefined(layout.deletedAt));

    return activeLayouts.map((layout) =>
      fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto(
        reconstructFlatPageLayoutWithTabsAndWidgets({
          layout,
          flatPageLayoutTabMaps,
          flatPageLayoutWidgetMaps,
        }),
      ),
    );
  }

  async findBy({
    workspaceId,
    filter: { objectMetadataId, pageLayoutType },
  }: {
    workspaceId: string;
    filter: {
      objectMetadataId?: string;
      pageLayoutType?: PageLayoutType;
    };
  }): Promise<PageLayoutDTO[]> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const activeLayouts = Object.values(
      flatPageLayoutMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((layout) => {
        const isNotDeleted = !isDefined(layout.deletedAt);
        const matchesObjectMetadataId = isNonEmptyString(objectMetadataId)
          ? layout.objectMetadataId === objectMetadataId
          : true;
        const matchesPageLayoutType = isDefined(pageLayoutType)
          ? layout.type === pageLayoutType
          : true;

        return isNotDeleted && matchesObjectMetadataId && matchesPageLayoutType;
      });

    return activeLayouts.map((layout) =>
      fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto(
        reconstructFlatPageLayoutWithTabsAndWidgets({
          layout,
          flatPageLayoutTabMaps,
          flatPageLayoutWidgetMaps,
        }),
      ),
    );
  }

  async findByIdOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<PageLayoutDTO> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const flatLayout = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatPageLayoutMaps,
    });

    const isLayoutNotFound =
      !isDefined(flatLayout) || isDefined(flatLayout.deletedAt);

    if (isLayoutNotFound) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
          id,
        ),
        PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
      );
    }

    return fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto(
      reconstructFlatPageLayoutWithTabsAndWidgets({
        layout: flatLayout,
        flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps,
      }),
    );
  }

  private async getPageLayoutFlatEntityMaps(workspaceId: string): Promise<{
    flatPageLayoutMaps: FlatPageLayoutMaps;
    flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
  }> {
    return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatPageLayoutMaps',
          'flatPageLayoutTabMaps',
          'flatPageLayoutWidgetMaps',
        ],
      },
    );
  }

  async create({
    createPageLayoutInput,
    workspaceId,
  }: {
    createPageLayoutInput: CreatePageLayoutInput;
    workspaceId: string;
  }): Promise<Omit<PageLayoutDTO, 'tabs'>> {
    if (!isNonEmptyString(createPageLayoutInput.name)) {
      throw new PageLayoutException(
        generatePageLayoutExceptionMessage(
          PageLayoutExceptionMessageKey.NAME_REQUIRED,
        ),
        PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const flatPageLayoutToCreate =
      fromCreatePageLayoutInputToFlatPageLayoutToCreate({
        createPageLayoutInput,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [flatPageLayoutToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating page layout',
      );
    }

    const { flatPageLayoutMaps: recomputedFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    return fromFlatPageLayoutToPageLayoutDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatPageLayoutToCreate.id,
        flatEntityMaps: recomputedFlatPageLayoutMaps,
      }),
    );
  }

  async update({
    id,
    workspaceId,
    updateData,
  }: {
    id: string;
    workspaceId: string;
    updateData: UpdatePageLayoutInput;
  }): Promise<Omit<PageLayoutDTO, 'tabs'>> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatPageLayoutMaps: existingFlatPageLayoutMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps', 'flatObjectMetadataMaps'],
        },
      );

    const updatePageLayoutInput: UpdatePageLayoutInputWithId = {
      id,
      update: updateData,
    };

    const flatPageLayoutToUpdate =
      fromUpdatePageLayoutInputToFlatPageLayoutToUpdateOrThrow({
        updatePageLayoutInput,
        flatPageLayoutMaps: existingFlatPageLayoutMaps,
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating page layout',
      );
    }

    const { flatPageLayoutMaps: recomputedFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const updatedLayout = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatPageLayoutMaps,
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByPageLayoutId(
      {
        pageLayoutId: id,
        workspaceId,
        updatedAt: new Date(updatedLayout.updatedAt),
      },
    );

    return fromFlatPageLayoutToPageLayoutDto(updatedLayout);
  }

  async destroy({
    id,
    workspaceId,
    isLinkedDashboardAlreadyDestroyed = false,
  }: {
    id: string;
    workspaceId: string;
    isLinkedDashboardAlreadyDestroyed?: boolean;
  }): Promise<boolean> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPageLayoutMaps: existingFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const flatPageLayoutToDestroy =
      fromDestroyPageLayoutInputToFlatPageLayoutOrThrow({
        destroyPageLayoutInput: { id },
        flatPageLayoutMaps: existingFlatPageLayoutMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatPageLayoutToDestroy],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying page layout',
      );
    }

    if (
      flatPageLayoutToDestroy.type === PageLayoutType.DASHBOARD &&
      !isLinkedDashboardAlreadyDestroyed
    ) {
      await this.destroyAssociatedDashboards({
        pageLayoutId: id,
        workspaceId,
      });
    }

    return true;
  }

  async destroyMany({
    ids,
    workspaceId,
  }: {
    ids: string[];
    workspaceId: string;
  }): Promise<boolean> {
    if (ids.length === 0) {
      return true;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPageLayoutMaps: existingFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const flatPageLayoutsToDestroy = ids.map((id) =>
      fromDestroyPageLayoutInputToFlatPageLayoutOrThrow({
        destroyPageLayoutInput: { id },
        flatPageLayoutMaps: existingFlatPageLayoutMaps,
      }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatPageLayoutsToDestroy,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying page layouts',
      );
    }

    return true;
  }

  private async destroyAssociatedDashboards({
    pageLayoutId,
    workspaceId,
  }: {
    pageLayoutId: string;
    workspaceId: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const dashboardRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          'dashboard',
          { shouldBypassPermissionChecks: true },
        );

      const dashboards = await dashboardRepository.find({
        where: {
          pageLayoutId,
        },
      });

      for (const dashboard of dashboards) {
        await dashboardRepository.delete(dashboard.id);
      }
    }, authContext);
  }
}
