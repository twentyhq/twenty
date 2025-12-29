import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { PageLayoutTabExceptionCode } from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';
import { validateAndTransformWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-and-transform-widget-configuration.util';
import { validateWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-grid-position.util';
import {
  FailedFlatEntityValidation,
  FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatPageLayoutWidgetValidatorService {
  constructor() {}

  public async validateFlatPageLayoutWidgetUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutWidgetMaps: optimisticFlatPageLayoutWidgetMaps,
    },
    additionalCacheDataMaps: { featureFlagsMap },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): Promise<FailedFlatEntityValidation<FlatPageLayoutWidget>> {
    const isDashboardV2Enabled =
      featureFlagsMap[FeatureFlagKey.IS_DASHBOARD_V2_ENABLED] ?? false;

    const validationResult: FailedFlatEntityValidation<FlatPageLayoutWidget> = {
      type: 'update_page_layout_widget',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingFlatPageLayoutWidget =
      optimisticFlatPageLayoutWidgetMaps.byId[flatEntityId];

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
      id: updatedFlatPageLayoutWidget.id,
      pageLayoutTabId: updatedFlatPageLayoutWidget.pageLayoutTabId,
    };

    const gridPositionErrors = this.validateGridPosition({
      gridPosition: updatedFlatPageLayoutWidget.gridPosition,
      widgetTitle: updatedFlatPageLayoutWidget.title,
    });

    validationResult.errors.push(...gridPositionErrors);

    const configurationErrors = await this.validateWidgetConfiguration({
      type: updatedFlatPageLayoutWidget.type,
      configuration: updatedFlatPageLayoutWidget.configuration,
      widgetTitle: updatedFlatPageLayoutWidget.title,
      isDashboardV2Enabled,
    });

    validationResult.errors.push(...configurationErrors);

    return validationResult;
  }

  public validateFlatPageLayoutWidgetDeletion({
    flatEntityToValidate: { id: pageLayoutWidgetIdToDelete },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutWidgetMaps: optimisticFlatPageLayoutWidgetMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): FailedFlatEntityValidation<FlatPageLayoutWidget> {
    const validationResult: FailedFlatEntityValidation<FlatPageLayoutWidget> = {
      type: 'delete_page_layout_widget',
      errors: [],
      flatEntityMinimalInformation: {
        id: pageLayoutWidgetIdToDelete,
      },
    };

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
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps: optimisticFlatPageLayoutWidgetMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): Promise<FailedFlatEntityValidation<FlatPageLayoutWidget>> {
    const isDashboardV2Enabled =
      featureFlagsMap[FeatureFlagKey.IS_DASHBOARD_V2_ENABLED] ?? false;

    const validationResult: FailedFlatEntityValidation<FlatPageLayoutWidget> = {
      type: 'create_page_layout_widget',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatPageLayoutWidgetToValidate.id,
        pageLayoutTabId: flatPageLayoutWidgetToValidate.pageLayoutTabId,
      },
    };

    const existingFlatPageLayoutWidget =
      optimisticFlatPageLayoutWidgetMaps.byId[
        flatPageLayoutWidgetToValidate.id
      ];

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
      flatEntityMaps: flatPageLayoutTabMaps,
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

    const configurationErrors = await this.validateWidgetConfiguration({
      type: flatPageLayoutWidgetToValidate.type,
      configuration: flatPageLayoutWidgetToValidate.configuration,
      widgetTitle: flatPageLayoutWidgetToValidate.title,
      isDashboardV2Enabled,
    });

    validationResult.errors.push(...configurationErrors);

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

  private async validateWidgetConfiguration({
    type,
    configuration,
    widgetTitle,
    isDashboardV2Enabled,
  }: {
    type: WidgetType | undefined;
    configuration: AllPageLayoutWidgetConfiguration | null | undefined;
    widgetTitle: string;
    isDashboardV2Enabled: boolean;
  }): Promise<FlatEntityValidationError[]> {
    const errors: FlatEntityValidationError[] = [];

    if (!isDefined(configuration) || !isDefined(type)) {
      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Invalid configuration for widget "${widgetTitle}": Configuration is required`,
        userFriendlyMessage: msg`Invalid widget configuration`,
      });

      return errors;
    }

    try {
      await validateAndTransformWidgetConfiguration({
        type,
        configuration,
        isDashboardV2Enabled,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Invalid configuration for widget "${widgetTitle}": ${errorMessage}`,
        userFriendlyMessage: msg`Invalid widget configuration`,
      });
    }

    return errors;
  }
}
