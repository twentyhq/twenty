import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetPosition,
  type GridPosition,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FlatPageLayoutWidgetTypeValidatorService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { PageLayoutTabExceptionCode } from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validatePageLayoutWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-page-layout-widget-grid-position.util';
import { validatePageLayoutWidgetVerticalListPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-page-layout-widget-vertical-list-position.util';
import { validateWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-grid-position.util';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import {
  FailedFlatEntityValidation,
  FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatPageLayoutWidgetValidatorService {
  constructor(
    private readonly flatPageLayoutWidgetTypeValidatorService: FlatPageLayoutWidgetTypeValidatorService,
  ) {}

  public async validateFlatPageLayoutWidgetUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    additionalCacheDataMaps: { featureFlagsMap },
    workspaceId,
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): Promise<FailedFlatEntityValidation<'pageLayoutWidget', 'update'>> {
    const isDashboardV2Enabled =
      featureFlagsMap[FeatureFlagKey.IS_DASHBOARD_V2_ENABLED] ?? false;

    const existingFlatPageLayoutWidget = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutWidgetMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
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
      ...flatEntityUpdate,
    };

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      pageLayoutTabUniversalIdentifier:
        updatedFlatPageLayoutWidget.pageLayoutTabUniversalIdentifier,
    };

    const referencedPageLayoutTab = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        updatedFlatPageLayoutWidget.pageLayoutTabUniversalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutTabMaps,
    });

    const gridPositionErrors = this.validateGridPosition({
      gridPosition: updatedFlatPageLayoutWidget.gridPosition,
      widgetTitle: updatedFlatPageLayoutWidget.title,
    });

    validationResult.errors.push(...gridPositionErrors);

    const positionErrors = this.validatePosition({
      position: updatedFlatPageLayoutWidget.position,
      pageLayoutTab: referencedPageLayoutTab,
      widgetTitle: updatedFlatPageLayoutWidget.title,
    });

    validationResult.errors.push(...positionErrors);

    const featureFlagErrors = this.validateFeatureFlags({
      type: updatedFlatPageLayoutWidget.type,
      configuration: updatedFlatPageLayoutWidget.universalConfiguration,
      widgetTitle: updatedFlatPageLayoutWidget.title,
      isDashboardV2Enabled,
    });

    validationResult.errors.push(...featureFlagErrors);

    const typeSpecificityErrors =
      this.flatPageLayoutWidgetTypeValidatorService.validateFlatPageLayoutWidgetTypeSpecificitiesForUpdate(
        {
          flatEntityToValidate: updatedFlatPageLayoutWidget,
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
          update: flatEntityUpdate,
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
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutWidgetMaps: optimisticFlatPageLayoutWidgetMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): FailedFlatEntityValidation<'pageLayoutWidget', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'pageLayoutWidget',
      type: 'delete',
    });

    const existingFlatPageLayoutWidget = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPageLayoutWidgetMaps,
    });

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
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): Promise<FailedFlatEntityValidation<'pageLayoutWidget', 'create'>> {
    const isDashboardV2Enabled =
      featureFlagsMap[FeatureFlagKey.IS_DASHBOARD_V2_ENABLED] ?? false;

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPageLayoutWidgetToValidate.universalIdentifier,
        pageLayoutTabUniversalIdentifier:
          flatPageLayoutWidgetToValidate.pageLayoutTabUniversalIdentifier,
      },
      metadataName: 'pageLayoutWidget',
      type: 'create',
    });

    const existingFlatPageLayoutWidget = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPageLayoutWidgetToValidate.universalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutWidgetMaps,
    });

    if (isDefined(existingFlatPageLayoutWidget)) {
      const flatPageLayoutWidgetUniversalIdentifier =
        flatPageLayoutWidgetToValidate.universalIdentifier;

      validationResult.errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Page layout widget with universal identifier ${flatPageLayoutWidgetUniversalIdentifier} already exists`,
        userFriendlyMessage: msg`Page layout widget already exists`,
      });
    }

    const referencedPageLayoutTab = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatPageLayoutWidgetToValidate.pageLayoutTabUniversalIdentifier,
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

    const positionErrors = this.validatePosition({
      position: flatPageLayoutWidgetToValidate.position,
      pageLayoutTab: referencedPageLayoutTab,
      widgetTitle: flatPageLayoutWidgetToValidate.title,
    });

    validationResult.errors.push(...positionErrors);

    const featureFlagErrors = this.validateFeatureFlags({
      type: flatPageLayoutWidgetToValidate.type,
      configuration: flatPageLayoutWidgetToValidate.universalConfiguration,
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
    configuration: { configurationType?: unknown } | null | undefined;
    widgetTitle: string;
    isDashboardV2Enabled: boolean;
  }): FlatEntityValidationError[] {
    if (!isDefined(type) || !isDefined(configuration)) {
      return [];
    }

    if (type !== WidgetType.GRAPH) {
      return [];
    }

    const graphConfiguration = configuration as {
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

  private validatePosition({
    position,
    pageLayoutTab,
    widgetTitle,
  }: {
    position: PageLayoutWidgetPosition | null | undefined;
    pageLayoutTab: UniversalFlatPageLayoutTab | undefined;
    widgetTitle: string;
  }): FlatEntityValidationError[] {
    if (!isDefined(position)) {
      return [];
    }

    const errors: FlatEntityValidationError[] = [];

    if (
      isDefined(pageLayoutTab) &&
      position.layoutMode !== pageLayoutTab.layoutMode
    ) {
      const layoutMode = position.layoutMode;
      const tabLayoutMode = pageLayoutTab.layoutMode;

      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Position layoutMode "${layoutMode}" does not match tab layoutMode "${tabLayoutMode}"`,
        userFriendlyMessage: msg`Widget position type must match the tab layout mode`,
      });
    }

    switch (position.layoutMode) {
      case PageLayoutTabLayoutMode.GRID:
        errors.push(
          ...validatePageLayoutWidgetGridPosition(position, widgetTitle),
        );
        break;
      case PageLayoutTabLayoutMode.VERTICAL_LIST:
        errors.push(
          ...validatePageLayoutWidgetVerticalListPosition(
            position,
            widgetTitle,
          ),
        );
        break;
      case PageLayoutTabLayoutMode.CANVAS:
        break;
    }

    return errors;
  }
}
