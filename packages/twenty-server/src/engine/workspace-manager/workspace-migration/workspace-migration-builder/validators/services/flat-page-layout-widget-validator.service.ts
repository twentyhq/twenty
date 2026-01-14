import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatPageLayoutWidgetTypeValidatorService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { PageLayoutTabExceptionCode } from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';
import { validateWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-grid-position.util';
import {
  FailedFlatEntityValidation,
  FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatPageLayoutWidgetValidatorService {
  constructor(
    private readonly flatPageLayoutWidgetTypeValidatorService: FlatPageLayoutWidgetTypeValidatorService,
  ) {}

  public async validateFlatPageLayoutWidgetUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    additionalCacheDataMaps: { featureFlagsMap },
    workspaceId,
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): Promise<FailedFlatEntityValidation<'pageLayoutWidget', 'update'>> {
    const isDashboardV2Enabled =
      featureFlagsMap[FeatureFlagKey.IS_DASHBOARD_V2_ENABLED] ?? false;

    const existingFlatPageLayoutWidget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatEntityId,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutWidgetMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingFlatPageLayoutWidget?.universalIdentifier,
      },
      metadataName: 'pageLayoutWidget',
      type: 'update',
    });

    if (!isDefined(existingFlatPageLayoutWidget)) {
      validationResult.errors.push({
        code: PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
        message: t`Page layout widget to update not found`,
        userFriendlyMessage: msg`Page layout widget to update not found`,
      });

      return validationResult;
    }

    const updatedFlatPageLayoutWidget = {
      ...existingFlatPageLayoutWidget,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      id: updatedFlatPageLayoutWidget.id,
      pageLayoutTabId: updatedFlatPageLayoutWidget.pageLayoutTabId,
    };

    const gridPositionErrors = this.validateGridPosition({
      gridPosition: updatedFlatPageLayoutWidget.gridPosition,
      widgetTitle: updatedFlatPageLayoutWidget.title,
    });

    validationResult.errors.push(...gridPositionErrors);

    const featureFlagErrors = this.validateFeatureFlags({
      type: updatedFlatPageLayoutWidget.type,
      configuration: updatedFlatPageLayoutWidget.configuration,
      widgetTitle: updatedFlatPageLayoutWidget.title,
      isDashboardV2Enabled,
    });

    validationResult.errors.push(...featureFlagErrors);

    const typeSpecificityErrors =
      this.flatPageLayoutWidgetTypeValidatorService.validateFlatPageLayoutWidgetTypeSpecificitiesForUpdate(
        {
          flatEntityToValidate: updatedFlatPageLayoutWidget,
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
          updates: flatEntityUpdates,
          additionalCacheDataMaps: { featureFlagsMap },
          workspaceId,
          buildOptions,
          remainingFlatEntityMapsToValidate:
            optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutWidgetMaps,
        },
      );

    validationResult.errors.push(...typeSpecificityErrors);

    return validationResult;
  }

  public validateFlatPageLayoutWidgetDeletion({
    flatEntityToValidate: {
      id: pageLayoutWidgetIdToDelete,
      universalIdentifier,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutWidgetMaps: optimisticFlatPageLayoutWidgetMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): FailedFlatEntityValidation<'pageLayoutWidget', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: pageLayoutWidgetIdToDelete,
        universalIdentifier,
      },
      metadataName: 'pageLayoutWidget',
      type: 'delete',
    });

    const existingFlatPageLayoutWidget =
      optimisticFlatPageLayoutWidgetMaps.byId[pageLayoutWidgetIdToDelete];

    if (!isDefined(existingFlatPageLayoutWidget)) {
      validationResult.errors.push({
        code: PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
        message: t`Page layout widget to delete not found`,
        userFriendlyMessage: msg`Page layout widget to delete not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public async validateFlatPageLayoutWidgetCreation({
    flatEntityToValidate: flatPageLayoutWidgetToValidate,
    additionalCacheDataMaps: { featureFlagsMap },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    workspaceId,
    buildOptions,
    remainingFlatEntityMapsToValidate,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): Promise<FailedFlatEntityValidation<'pageLayoutWidget', 'create'>> {
    const isDashboardV2Enabled =
      featureFlagsMap[FeatureFlagKey.IS_DASHBOARD_V2_ENABLED] ?? false;

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatPageLayoutWidgetToValidate.id,
        universalIdentifier: flatPageLayoutWidgetToValidate.universalIdentifier,
        pageLayoutTabId: flatPageLayoutWidgetToValidate.pageLayoutTabId,
      },
      metadataName: 'pageLayoutWidget',
      type: 'create',
    });

    const existingFlatPageLayoutWidget =
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutWidgetMaps
        .byId[flatPageLayoutWidgetToValidate.id];

    if (isDefined(existingFlatPageLayoutWidget)) {
      const flatPageLayoutWidgetId = flatPageLayoutWidgetToValidate.id;

      validationResult.errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Page layout widget with id ${flatPageLayoutWidgetId} already exists`,
        userFriendlyMessage: msg`Page layout widget already exists`,
      });
    }

    const referencedPageLayoutTab = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatPageLayoutWidgetToValidate.pageLayoutTabId,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutTabMaps,
    });

    if (!isDefined(referencedPageLayoutTab)) {
      validationResult.errors.push({
        code: PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
        message: t`Page layout tab not found`,
        userFriendlyMessage: msg`Page layout tab not found`,
      });
    }

    const gridPositionErrors = this.validateGridPosition({
      gridPosition: flatPageLayoutWidgetToValidate.gridPosition,
      widgetTitle: flatPageLayoutWidgetToValidate.title,
    });

    validationResult.errors.push(...gridPositionErrors);

    const featureFlagErrors = this.validateFeatureFlags({
      type: flatPageLayoutWidgetToValidate.type,
      configuration: flatPageLayoutWidgetToValidate.configuration,
      widgetTitle: flatPageLayoutWidgetToValidate.title,
      isDashboardV2Enabled,
    });

    validationResult.errors.push(...featureFlagErrors);

    const typeSpecificityErrors =
      this.flatPageLayoutWidgetTypeValidatorService.validateFlatPageLayoutWidgetTypeSpecificitiesForCreation(
        {
          flatEntityToValidate: flatPageLayoutWidgetToValidate,
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
          additionalCacheDataMaps: { featureFlagsMap },
          workspaceId,
          buildOptions,
          remainingFlatEntityMapsToValidate,
        },
      );

    validationResult.errors.push(...typeSpecificityErrors);

    return validationResult;
  }

  private validateGridPosition({
    gridPosition,
    widgetTitle,
  }: {
    gridPosition: GridPosition | undefined;
    widgetTitle: string;
  }): FlatEntityValidationError[] {
    if (!isDefined(gridPosition)) {
      return [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: t`Grid position is required`,
          userFriendlyMessage: msg`Grid position is required`,
        },
      ];
    }

    return validateWidgetGridPosition(gridPosition, widgetTitle);
  }

  private validateFeatureFlags({
    type,
    configuration,
    widgetTitle,
    isDashboardV2Enabled,
  }: {
    type: WidgetType | undefined;
    configuration: AllPageLayoutWidgetConfiguration | null | undefined;
    widgetTitle: string;
    isDashboardV2Enabled: boolean;
  }): FlatEntityValidationError[] {
    if (!isDefined(type) || !isDefined(configuration)) {
      return [];
    }

    if (type !== WidgetType.GRAPH) {
      return [];
    }

    const graphConfiguration = configuration as unknown as {
      configurationType?: GraphType;
    };

    if (
      graphConfiguration.configurationType === GraphType.GAUGE_CHART &&
      !isDashboardV2Enabled
    ) {
      const chartType = graphConfiguration.configurationType;

      return [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: t`Invalid configuration for widget "${widgetTitle}": Chart type ${chartType} requires IS_DASHBOARD_V2_ENABLED feature flag`,
          userFriendlyMessage: msg`This chart type requires the Dashboard V2 feature to be enabled`,
        },
      ];
    }

    return [];
  }
}
