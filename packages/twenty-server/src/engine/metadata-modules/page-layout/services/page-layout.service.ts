import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { fromCreatePageLayoutInputToFlatPageLayoutToCreate } from 'src/engine/metadata-modules/flat-page-layout/utils/from-create-page-layout-input-to-flat-page-layout-to-create.util';
import { fromDeletePageLayoutInputToFlatPageLayoutOrThrow } from 'src/engine/metadata-modules/flat-page-layout/utils/from-delete-page-layout-input-to-flat-page-layout-or-throw.util';
import { fromDestroyPageLayoutInputToFlatPageLayoutOrThrow } from 'src/engine/metadata-modules/flat-page-layout/utils/from-destroy-page-layout-input-to-flat-page-layout-or-throw.util';
import { fromRestorePageLayoutInputToFlatPageLayoutOrThrow } from 'src/engine/metadata-modules/flat-page-layout/utils/from-restore-page-layout-input-to-flat-page-layout-or-throw.util';
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
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class PageLayoutService {
  private readonly logger = new Logger(PageLayoutService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<PageLayoutDTO[]> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const activeLayouts = Object.values(flatPageLayoutMaps.byId)
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

  async findByObjectMetadataId(
    workspaceId: string,
    objectMetadataId: string,
  ): Promise<PageLayoutDTO[]> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const activeLayouts = Object.values(flatPageLayoutMaps.byId)
      .filter(isDefined)
      .filter(
        (layout) =>
          layout.objectMetadataId === objectMetadataId &&
          !isDefined(layout.deletedAt),
      );

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

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<PageLayoutDTO> {
    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.getPageLayoutFlatEntityMaps(workspaceId);

    const flatLayout = flatPageLayoutMaps.byId[id];

    if (!isDefined(flatLayout) || isDefined(flatLayout.deletedAt)) {
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

  async create(
    createPageLayoutInput: CreatePageLayoutInput,
    workspaceId: string,
  ): Promise<Omit<PageLayoutDTO, 'tabs'>> {
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

    const flatPageLayoutToCreate =
      fromCreatePageLayoutInputToFlatPageLayoutToCreate({
        createPageLayoutInput,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
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

  async update(
    id: string,
    workspaceId: string,
    updateData: UpdatePageLayoutInput,
  ): Promise<Omit<PageLayoutDTO, 'tabs'>> {
    const { flatPageLayoutMaps: existingFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
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

    return fromFlatPageLayoutToPageLayoutDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedFlatPageLayoutMaps,
      }),
    );
  }

  async delete(
    id: string,
    workspaceId: string,
  ): Promise<Omit<PageLayoutDTO, 'tabs'>> {
    const { flatPageLayoutMaps: existingFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const flatPageLayoutToDelete =
      fromDeletePageLayoutInputToFlatPageLayoutOrThrow({
        deletePageLayoutInput: { id },
        flatPageLayoutMaps: existingFlatPageLayoutMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutToDelete],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting page layout',
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
        flatEntityId: id,
        flatEntityMaps: recomputedFlatPageLayoutMaps,
      }),
    );
  }

  async destroy(
    id: string,
    workspaceId: string,
  ): Promise<Omit<PageLayoutDTO, 'tabs'>> {
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying page layout',
      );
    }

    if (flatPageLayoutToDestroy.type === PageLayoutType.DASHBOARD) {
      await this.destroyAssociatedDashboards(id, workspaceId);
    }

    return fromFlatPageLayoutToPageLayoutDto(flatPageLayoutToDestroy);
  }

  private async destroyAssociatedDashboards(
    pageLayoutId: string,
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
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
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to destroy associated dashboards for page layout ${pageLayoutId}: ${error}`,
      );
    }
  }

  async restore(
    id: string,
    workspaceId: string,
  ): Promise<Omit<PageLayoutDTO, 'tabs'>> {
    const { flatPageLayoutMaps: existingFlatPageLayoutMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutMaps'],
        },
      );

    const flatPageLayoutToRestore =
      fromRestorePageLayoutInputToFlatPageLayoutOrThrow({
        restorePageLayoutInput: { id },
        flatPageLayoutMaps: existingFlatPageLayoutMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatPageLayoutToRestore],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while restoring page layout',
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
        flatEntityId: id,
        flatEntityMaps: recomputedFlatPageLayoutMaps,
      }),
    );
  }
}
