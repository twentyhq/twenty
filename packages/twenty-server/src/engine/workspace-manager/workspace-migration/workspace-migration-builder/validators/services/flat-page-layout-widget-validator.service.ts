import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetPosition,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-shared/types';
import {
  getPageLayoutWidgetHeightBehavior,
  isDefined,
} from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FlatPageLayoutWidgetTypeValidatorService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { PageLayoutTabExceptionCode } from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import {
  generatePageLayoutWidgetExceptionMessage,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validatePageLayoutWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-page-layout-widget-grid-position.util';
import { validatePageLayoutWidgetVerticalListPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-page-layout-widget-vertical-list-position.util';
import { resolveEffectiveEntity } from 'src/engine/metadata-modules/utils/resolve-effective-entity.util';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import {
  FailedFlatEntityValidation,
  FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityCreationValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-creation-validation-args.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type EffectivePageLayoutWidget = Omit<
  UniversalFlatPageLayoutWidget,
  'pageLayoutTabUniversalIdentifier'
> & {
  pageLayoutTabUniversalIdentifier: string | null;
};

@Injectable()
export class FlatPageLayoutWidgetValidatorService {
  constructor(
    private readonly flatPageLayoutWidgetTypeValidatorService: FlatPageLayoutWidgetTypeValidatorService,
  ) {}

  public async validateFlatPageLayoutWidgetUpdate({
    universalIdentifier,
    flatEntityUpdate,
    finalFlatEntityMaps,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    additionalCacheDataMaps: { featureFlagsMap },
    workspaceId,
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): Promise<FailedFlatEntityValidation<'pageLayoutWidget', 'update'>> {
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

    const effectiveWidget = this.getEffectiveWidget(
      updatedFlatPageLayoutWidget,
    );
    const effectivePageLayoutTabUniversalIdentifier =
      effectiveWidget.pageLayoutTabUniversalIdentifier;

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      pageLayoutTabUniversalIdentifier:
        effectivePageLayoutTabUniversalIdentifier ?? undefined,
    };

    const referencedPageLayoutTab = isDefined(
      effectivePageLayoutTabUniversalIdentifier,
    )
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier: effectivePageLayoutTabUniversalIdentifier,
          flatEntityMaps:
            optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutTabMaps,
        })
      : undefined;

    if (
      isDefined(effectivePageLayoutTabUniversalIdentifier) &&
      !isDefined(referencedPageLayoutTab)
    ) {
      validationResult.errors.push({
        code: PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
        message: t`Page layout tab not found`,
        userFriendlyMessage: msg`Page layout tab not found`,
      });
    }

    const positionErrors = this.validatePosition({
      position: effectiveWidget.position,
      pageLayoutTab: referencedPageLayoutTab,
      widgetTitle: updatedFlatPageLayoutWidget.title,
    });

    validationResult.errors.push(...positionErrors);
    validationResult.errors.push(
      ...this.validateTabViewportConstraints({
        widget: effectiveWidget,
        pageLayoutTab: referencedPageLayoutTab,
        relatedWidgets: Object.values(
          finalFlatEntityMaps.byUniversalIdentifier,
        ).filter(isDefined),
      }),
    );

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
    finalFlatEntityMaps,
    flatEntityToValidate: flatPageLayoutWidgetToValidate,
    additionalCacheDataMaps: { featureFlagsMap },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    workspaceId,
    buildOptions,
    remainingFlatEntityMapsToValidate,
  }: FlatEntityCreationValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): Promise<FailedFlatEntityValidation<'pageLayoutWidget', 'create'>> {
    const effectiveWidget = this.getEffectiveWidget(
      flatPageLayoutWidgetToValidate,
    );
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

    const referencedPageLayoutTab = isDefined(
      effectiveWidget.pageLayoutTabUniversalIdentifier,
    )
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier: effectiveWidget.pageLayoutTabUniversalIdentifier,
          flatEntityMaps:
            optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutTabMaps,
        })
      : undefined;

    if (
      isDefined(effectiveWidget.pageLayoutTabUniversalIdentifier) &&
      !isDefined(referencedPageLayoutTab)
    ) {
      validationResult.errors.push({
        code: PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
        message: t`Page layout tab not found`,
        userFriendlyMessage: msg`Page layout tab not found`,
      });
    }

    const positionErrors = this.validatePosition({
      position: effectiveWidget.position,
      pageLayoutTab: referencedPageLayoutTab,
      widgetTitle: flatPageLayoutWidgetToValidate.title,
    });

    validationResult.errors.push(...positionErrors);
    validationResult.errors.push(
      ...this.validateTabViewportConstraints({
        widget: effectiveWidget,
        pageLayoutTab: referencedPageLayoutTab,
        relatedWidgets: Object.values(
          finalFlatEntityMaps.byUniversalIdentifier,
        ).filter(isDefined),
      }),
    );

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

  private getEffectiveWidget(
    widget: UniversalFlatPageLayoutWidget,
  ): EffectivePageLayoutWidget {
    return resolveEffectiveEntity({
      ...widget,
      overrides: widget.universalOverrides,
    });
  }

  private validateTabViewportConstraints({
    widget,
    pageLayoutTab,
    relatedWidgets,
  }: {
    widget: EffectivePageLayoutWidget;
    pageLayoutTab: UniversalFlatPageLayoutTab | undefined;
    relatedWidgets: UniversalFlatPageLayoutWidget[];
  }): FlatEntityValidationError[] {
    if (
      !widget.isActive ||
      pageLayoutTab?.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST
    ) {
      return [];
    }

    const isTabViewportWidget = this.isViewportFillingWidget(widget);

    const widgetIndex =
      widget.position?.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
        ? widget.position.index
        : 0;
    const activeSiblingWidgets = relatedWidgets
      .map((relatedWidget) => this.getEffectiveWidget(relatedWidget))
      .filter(
        (relatedWidget) =>
          relatedWidget.universalIdentifier !== widget.universalIdentifier &&
          relatedWidget.isActive &&
          relatedWidget.pageLayoutTabUniversalIdentifier ===
            widget.pageLayoutTabUniversalIdentifier,
      );

    const errors: FlatEntityValidationError[] = [];
    const hasAnotherTabViewportWidget = activeSiblingWidgets.some(
      (siblingWidget) => this.isViewportFillingWidget(siblingWidget),
    );

    if (isTabViewportWidget && hasAnotherTabViewportWidget) {
      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_POSITION,
          widget.title,
          undefined,
          'only one active TAB_VIEWPORT widget is allowed per vertical-list tab',
        ),
        userFriendlyMessage: msg`Only one full-height widget is allowed per tab`,
      });
    }

    const hasInvalidWidgetOrdering = activeSiblingWidgets.some(
      (siblingWidget) => {
        const siblingIndex =
          siblingWidget.position?.layoutMode ===
          PageLayoutTabLayoutMode.VERTICAL_LIST
            ? siblingWidget.position.index
            : 0;

        const isSiblingTabViewport =
          this.isViewportFillingWidget(siblingWidget);

        return isTabViewportWidget
          ? !isSiblingTabViewport && siblingIndex >= widgetIndex
          : isSiblingTabViewport && siblingIndex <= widgetIndex;
      },
    );

    if (hasInvalidWidgetOrdering) {
      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_POSITION,
          widget.title,
          undefined,
          'TAB_VIEWPORT widgets must be ordered after fit-content widgets',
        ),
        userFriendlyMessage: msg`Full-height widgets must be placed after fit-content widgets`,
      });
    }

    return errors;
  }

  private isViewportFillingWidget(
    widget: Pick<UniversalFlatPageLayoutWidget, 'type' | 'position'>,
  ): boolean {
    return (
      getPageLayoutWidgetHeightBehavior({
        widgetType: widget.type,
        heightBehavior:
          widget.position?.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
            ? widget.position.heightBehavior
            : undefined,
      }) === PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT
    );
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
      default:
        errors.push({
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: t`Invalid widget position layout mode`,
          userFriendlyMessage: msg`Invalid widget position layout mode`,
        });
    }

    return errors;
  }
}
