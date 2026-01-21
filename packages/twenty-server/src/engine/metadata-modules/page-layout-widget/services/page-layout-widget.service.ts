import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-create-page-layout-widget-input-to-flat-page-layout-widget-to-create.util';
import { fromDestroyPageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-destroy-page-layout-widget-input-to-flat-page-layout-widget-or-throw.util';
import {
  fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow,
  type UpdatePageLayoutWidgetInputWithId,
} from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-update-page-layout-widget-input-to-flat-page-layout-widget-to-update-or-throw.util';
import { CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget.input';
import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { fromFlatPageLayoutWidgetToPageLayoutWidgetDto } from 'src/engine/metadata-modules/page-layout-widget/utils/from-flat-page-layout-widget-to-page-layout-widget-dto.util';
import { validateWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-grid-position.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';

type WidgetMigrationOperations = {
  flatEntityToCreate: FlatPageLayoutWidget[];
  flatEntityToUpdate: FlatPageLayoutWidget[];
  flatEntityToDelete: FlatPageLayoutWidget[];
};

@Injectable()
export class PageLayoutWidgetService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly dashboardSyncService: DashboardSyncService,
  ) {}

  private async getFlatPageLayoutWidgetMaps(
    workspaceId: string,
  ): Promise<FlatPageLayoutWidgetMaps> {
    const { flatPageLayoutWidgetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    return flatPageLayoutWidgetMaps;
  }

  private async validateAndRunWidgetMigration({
    workspaceId,
    operations,
    errorMessage,
  }: {
    workspaceId: string;
    operations: WidgetMigrationOperations;
    errorMessage: string;
  }): Promise<void> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutWidget: operations,
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        errorMessage,
      );
    }
  }

  async findByPageLayoutTabId({
    workspaceId,
    pageLayoutTabId,
  }: {
    workspaceId: string;
    pageLayoutTabId: string;
  }): Promise<PageLayoutWidgetDTO[]> {
    const flatPageLayoutWidgetMaps =
      await this.getFlatPageLayoutWidgetMaps(workspaceId);

    return Object.values(flatPageLayoutWidgetMaps.byId)
      .filter(isDefined)
      .filter(
        (widget) =>
          widget.pageLayoutTabId === pageLayoutTabId &&
          !isDefined(widget.deletedAt),
      )
      .sort(
        (widgetA, widgetB) =>
          new Date(widgetA.createdAt).getTime() -
          new Date(widgetB.createdAt).getTime(),
      )
      .map(fromFlatPageLayoutWidgetToPageLayoutWidgetDto);
  }

  async findByIdOrThrow({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<PageLayoutWidgetDTO> {
    const flatPageLayoutWidgetMaps =
      await this.getFlatPageLayoutWidgetMaps(workspaceId);

    const flatWidget = flatPageLayoutWidgetMaps.byId[id];

    if (!isDefined(flatWidget) || isDefined(flatWidget.deletedAt)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    return fromFlatPageLayoutWidgetToPageLayoutWidgetDto(flatWidget);
  }

  async create({
    input,
    workspaceId,
  }: {
    input: CreatePageLayoutWidgetInput;
    workspaceId: string;
  }): Promise<PageLayoutWidgetDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatPageLayoutWidgetToCreate =
      fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate({
        createPageLayoutWidgetInput: input,
        workspaceId,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      });

    await this.validateAndRunWidgetMigration({
      workspaceId,
      operations: {
        flatEntityToCreate: [flatPageLayoutWidgetToCreate],
        flatEntityToUpdate: [],
        flatEntityToDelete: [],
      },
      errorMessage:
        'Multiple validation errors occurred while creating page layout widget',
    });

    const recomputedMaps = await this.getFlatPageLayoutWidgetMaps(workspaceId);

    const createdWidget = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatPageLayoutWidgetToCreate.id,
      flatEntityMaps: recomputedMaps,
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByWidgetId({
      widgetId: flatPageLayoutWidgetToCreate.id,
      workspaceId,
      updatedAt: new Date(createdWidget.updatedAt),
    });

    return fromFlatPageLayoutWidgetToPageLayoutWidgetDto(createdWidget);
  }

  async update({
    id,
    workspaceId,
    updateData,
  }: {
    id: string;
    workspaceId: string;
    updateData: UpdatePageLayoutWidgetInput;
  }): Promise<PageLayoutWidgetDTO> {
    const existingFlatPageLayoutWidgetMaps =
      await this.getFlatPageLayoutWidgetMaps(workspaceId);

    const existingWidget = this.getExistingWidgetOrThrow(
      id,
      existingFlatPageLayoutWidgetMaps,
    );

    if (updateData.gridPosition) {
      const titleForValidation = updateData.title ?? existingWidget.title;

      validateWidgetGridPosition(updateData.gridPosition, titleForValidation);
    }

    const updatePageLayoutWidgetInput: UpdatePageLayoutWidgetInputWithId = {
      id,
      update: {
        ...updateData,
      },
    };

    const flatPageLayoutWidgetToUpdate =
      fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow({
        updatePageLayoutWidgetInput,
        flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps,
      });

    await this.validateAndRunWidgetMigration({
      workspaceId,
      operations: {
        flatEntityToCreate: [],
        flatEntityToUpdate: [flatPageLayoutWidgetToUpdate],
        flatEntityToDelete: [],
      },
      errorMessage:
        'Multiple validation errors occurred while updating page layout widget',
    });

    const recomputedMaps = await this.getFlatPageLayoutWidgetMaps(workspaceId);

    const updatedWidget = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedMaps,
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByWidgetId({
      widgetId: id,
      workspaceId,
      updatedAt: new Date(updatedWidget.updatedAt),
    });

    return fromFlatPageLayoutWidgetToPageLayoutWidgetDto(updatedWidget);
  }

  private getExistingWidgetOrThrow(
    id: string,
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps,
  ): FlatPageLayoutWidget {
    const existingWidget = flatPageLayoutWidgetMaps.byId[id];

    if (!isDefined(existingWidget) || isDefined(existingWidget.deletedAt)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    return existingWidget;
  }

  async destroy({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<boolean> {
    const existingFlatPageLayoutWidgetMaps =
      await this.getFlatPageLayoutWidgetMaps(workspaceId);

    const flatPageLayoutWidgetToDestroy =
      fromDestroyPageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow({
        destroyPageLayoutWidgetInput: { id },
        flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps,
      });

    await this.validateAndRunWidgetMigration({
      workspaceId,
      operations: {
        flatEntityToCreate: [],
        flatEntityToUpdate: [],
        flatEntityToDelete: [flatPageLayoutWidgetToDestroy],
      },
      errorMessage:
        'Multiple validation errors occurred while destroying page layout widget',
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByWidgetId({
      widgetId: id,
      workspaceId,
      updatedAt: new Date(),
    });

    return true;
  }
}
