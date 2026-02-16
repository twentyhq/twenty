import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { transformRichTextV2Value } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
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
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { fromFlatPageLayoutWidgetToPageLayoutWidgetDto } from 'src/engine/metadata-modules/page-layout-widget/utils/from-flat-page-layout-widget-to-page-layout-widget-dto.util';
import { isChartFieldsForValidation } from 'src/engine/metadata-modules/page-layout-widget/utils/is-chart-fields-for-validation.util';
import { validateChartConfigurationFieldReferences } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-chart-configuration-field-references.util';
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
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutWidget: operations,
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        errorMessage,
      );
    }
  }

  private async enrichRichTextConfigurationBody(
    configuration: AllPageLayoutWidgetConfiguration,
  ): Promise<AllPageLayoutWidgetConfiguration> {
    if (
      configuration.configurationType !==
      WidgetConfigurationType.STANDALONE_RICH_TEXT
    ) {
      return configuration;
    }

    if (!isDefined(configuration.body)) {
      return configuration;
    }

    try {
      return {
        ...configuration,
        body: await transformRichTextV2Value(configuration.body),
      };
    } catch {
      return configuration;
    }
  }

  private async validateChartFieldReferencesIfApplicable({
    configuration,
    objectMetadataId,
    widgetType,
    workspaceId,
  }: {
    configuration: AllPageLayoutWidgetConfiguration;
    objectMetadataId?: string | null;
    widgetType?: WidgetType | null;
    workspaceId: string;
  }): Promise<void> {
    const needsChartValidation =
      isChartFieldsForValidation(configuration) ||
      widgetType === WidgetType.GRAPH;

    if (!needsChartValidation) {
      return;
    }

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps', 'flatObjectMetadataMaps'],
        },
      );

    try {
      validateChartConfigurationFieldReferences({
        configuration,
        objectMetadataId,
        widgetType,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });
    } catch (error) {
      throw new PageLayoutWidgetException(
        error instanceof Error ? error.message : String(error),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
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

    return Object.values(flatPageLayoutWidgetMaps.byUniversalIdentifier)
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

    const flatWidget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });

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
    const createInput = isDefined(input.configuration)
      ? {
          ...input,
          configuration: await this.enrichRichTextConfigurationBody(
            input.configuration,
          ),
        }
      : input;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatPageLayoutTabMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPageLayoutTabMaps',
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
          ],
        },
      );

    const flatPageLayoutWidgetToCreate =
      fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate({
        createPageLayoutWidgetInput: createInput,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatPageLayoutTabMaps,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    if (isDefined(createInput.configuration)) {
      await this.validateChartFieldReferencesIfApplicable({
        configuration: createInput.configuration,
        objectMetadataId: createInput.objectMetadataId ?? null,
        widgetType: createInput.type,
        workspaceId,
      });
    }

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

    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const isConfigurationBeingUpdated = Object.prototype.hasOwnProperty.call(
      updateData,
      'configuration',
    );

    const processedUpdateData =
      isConfigurationBeingUpdated && isDefined(updateData.configuration)
        ? {
            ...updateData,
            configuration: await this.enrichRichTextConfigurationBody(
              updateData.configuration,
            ),
          }
        : updateData;

    const updatePageLayoutWidgetInput: UpdatePageLayoutWidgetInputWithId = {
      id,
      update: {
        ...processedUpdateData,
      },
    };

    const flatPageLayoutWidgetToUpdate =
      fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow({
        updatePageLayoutWidgetInput,
        flatPageLayoutWidgetMaps: existingFlatPageLayoutWidgetMaps,
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
        flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      });

    const shouldValidateChartFields =
      isConfigurationBeingUpdated ||
      Object.prototype.hasOwnProperty.call(updateData, 'objectMetadataId') ||
      Object.prototype.hasOwnProperty.call(updateData, 'type');

    if (shouldValidateChartFields) {
      const isObjectMetadataIdBeingUpdated =
        Object.prototype.hasOwnProperty.call(updateData, 'objectMetadataId');
      const effectiveConfiguration = isConfigurationBeingUpdated
        ? processedUpdateData.configuration
        : existingWidget.configuration;
      const effectiveObjectMetadataId = isObjectMetadataIdBeingUpdated
        ? processedUpdateData.objectMetadataId
        : existingWidget.objectMetadataId;
      const effectiveWidgetType =
        processedUpdateData.type ?? existingWidget.type;

      if (isDefined(effectiveConfiguration)) {
        await this.validateChartFieldReferencesIfApplicable({
          configuration: effectiveConfiguration,
          objectMetadataId: effectiveObjectMetadataId,
          widgetType: effectiveWidgetType,
          workspaceId,
        });
      }
    }

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
    const existingWidget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });

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
