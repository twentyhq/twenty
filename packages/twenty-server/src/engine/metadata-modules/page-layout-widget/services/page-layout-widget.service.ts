import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-create-page-layout-widget-input-to-flat-page-layout-widget-to-create.util';
import { fromDeletePageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-delete-page-layout-widget-input-to-flat-page-layout-widget-or-throw.util';
import { fromDestroyPageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-destroy-page-layout-widget-input-to-flat-page-layout-widget-or-throw.util';
import { fromRestorePageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-restore-page-layout-widget-input-to-flat-page-layout-widget-or-throw.util';
import {
  fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow,
  type UpdatePageLayoutWidgetInputWithId,
} from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-update-page-layout-widget-input-to-flat-page-layout-widget-to-update-or-throw.util';
import { CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget.input';
import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { fromFlatPageLayoutWidgetToPageLayoutWidgetDto } from 'src/engine/metadata-modules/page-layout-widget/utils/from-flat-page-layout-widget-to-page-layout-widget-dto.util';
import { validateAndTransformWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-and-transform-widget-configuration.util';
import { validateWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-grid-position.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

type WidgetMigrationOperations = {
  flatEntityToCreate: FlatPageLayoutWidget[];
  flatEntityToUpdate: FlatPageLayoutWidget[];
  flatEntityToDelete: FlatPageLayoutWidget[];
};

@Injectable()
export class PageLayoutWidgetService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
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

  private async validateWidgetConfigurationOrThrow({
    type,
    configuration,
    workspaceId,
    titleForError,
  }: {
    type: WidgetType;
    configuration: AllPageLayoutWidgetConfiguration;
    workspaceId: string;
    titleForError: string;
  }): Promise<AllPageLayoutWidgetConfiguration> {
    const isDashboardV2Enabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_DASHBOARD_V2_ENABLED,
      workspaceId,
    );

    let validatedConfig: AllPageLayoutWidgetConfiguration | null = null;

    try {
      validatedConfig = await validateAndTransformWidgetConfiguration({
        type,
        configuration,
        isDashboardV2Enabled,
      });
    } catch (error) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_CONFIGURATION,
          titleForError,
          type,
          error instanceof Error ? error.message : String(error),
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    if (!isDefined(validatedConfig)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_CONFIGURATION,
          titleForError,
          type,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    return validatedConfig;
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
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        errorMessage,
      );
    }
  }

  async findByPageLayoutTabId(
    workspaceId: string,
    pageLayoutTabId: string,
  ): Promise<PageLayoutWidgetDTO[]> {
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

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<PageLayoutWidgetDTO> {
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

  async create(
    createPageLayoutWidgetInput: CreatePageLayoutWidgetInput,
    workspaceId: string,
  ): Promise<PageLayoutWidgetDTO> {
    this.validateCreateInput(createPageLayoutWidgetInput);

    validateWidgetGridPosition(
      createPageLayoutWidgetInput.gridPosition,
      createPageLayoutWidgetInput.title,
    );

    const validatedConfig = await this.getValidatedConfigurationForCreate(
      createPageLayoutWidgetInput,
      workspaceId,
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatPageLayoutWidgetToCreate =
      fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate({
        createPageLayoutWidgetInput: {
          ...createPageLayoutWidgetInput,
          configuration: validatedConfig,
        },
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

    return fromFlatPageLayoutWidgetToPageLayoutWidgetDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatPageLayoutWidgetToCreate.id,
        flatEntityMaps: recomputedMaps,
      }),
    );
  }

  private validateCreateInput(input: CreatePageLayoutWidgetInput): void {
    if (!isDefined(input.title)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.TITLE_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    if (!isDefined(input.pageLayoutTabId)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_ID_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    if (!isDefined(input.gridPosition)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.GRID_POSITION_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }
  }

  private async getValidatedConfigurationForCreate(
    input: CreatePageLayoutWidgetInput,
    workspaceId: string,
  ): Promise<AllPageLayoutWidgetConfiguration> {
    return await this.validateWidgetConfigurationOrThrow({
      type: input.type,
      configuration: input.configuration,
      workspaceId,
      titleForError: input.title,
    });
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: UpdatePageLayoutWidgetInput,
  ): Promise<PageLayoutWidgetDTO> {
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

    const validatedConfig = await this.getValidatedConfigurationForUpdate(
      updateData,
      existingWidget,
      workspaceId,
    );

    const updatePageLayoutWidgetInput: UpdatePageLayoutWidgetInputWithId = {
      id,
      update: {
        ...updateData,
        ...(isDefined(validatedConfig)
          ? {
              configuration: validatedConfig,
            }
          : {}),
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

    return fromFlatPageLayoutWidgetToPageLayoutWidgetDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedMaps,
      }),
    );
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

  private async getValidatedConfigurationForUpdate(
    updateData: UpdatePageLayoutWidgetInput,
    existingWidget: FlatPageLayoutWidget,
    workspaceId: string,
  ): Promise<AllPageLayoutWidgetConfiguration | undefined> {
    if (!isDefined(updateData.configuration)) {
      return undefined;
    }

    const typeForValidation = updateData.type ?? existingWidget.type;
    const titleForError = updateData.title ?? existingWidget.title;

    return await this.validateWidgetConfigurationOrThrow({
      type: typeForValidation,
      configuration: updateData.configuration,
      workspaceId,
      titleForError,
    });
  }

  async delete(id: string, workspaceId: string): Promise<PageLayoutWidgetDTO> {
    const existingFlatPageLayoutWidgetMaps =
      await this.getFlatPageLayoutWidgetMaps(workspaceId);

    const flatPageLayoutWidgetToDelete =
      fromDeletePageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow({
        deletePageLayoutWidgetInput: { id },
        flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps,
      });

    await this.validateAndRunWidgetMigration({
      workspaceId,
      operations: {
        flatEntityToCreate: [],
        flatEntityToUpdate: [flatPageLayoutWidgetToDelete],
        flatEntityToDelete: [],
      },
      errorMessage:
        'Multiple validation errors occurred while deleting page layout widget',
    });

    const recomputedMaps = await this.getFlatPageLayoutWidgetMaps(workspaceId);

    return fromFlatPageLayoutWidgetToPageLayoutWidgetDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedMaps,
      }),
    );
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
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

    return true;
  }

  async restore(id: string, workspaceId: string): Promise<PageLayoutWidgetDTO> {
    const existingFlatPageLayoutWidgetMaps =
      await this.getFlatPageLayoutWidgetMaps(workspaceId);

    const flatPageLayoutWidgetToRestore =
      fromRestorePageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow({
        restorePageLayoutWidgetInput: { id },
        flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps,
      });

    await this.validateAndRunWidgetMigration({
      workspaceId,
      operations: {
        flatEntityToCreate: [],
        flatEntityToUpdate: [flatPageLayoutWidgetToRestore],
        flatEntityToDelete: [],
      },
      errorMessage:
        'Multiple validation errors occurred while restoring page layout widget',
    });

    const recomputedMaps = await this.getFlatPageLayoutWidgetMaps(workspaceId);

    return fromFlatPageLayoutWidgetToPageLayoutWidgetDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: id,
        flatEntityMaps: recomputedMaps,
      }),
    );
  }
}
