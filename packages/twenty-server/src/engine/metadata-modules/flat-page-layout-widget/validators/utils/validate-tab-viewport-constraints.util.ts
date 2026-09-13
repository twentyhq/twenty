import { msg } from '@lingui/core/macro';
import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-shared/types';
import { getPageLayoutWidgetHeightBehavior } from 'twenty-shared/utils';

import {
  generatePageLayoutWidgetExceptionMessage,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { resolveEffectiveEntity } from 'src/engine/metadata-modules/utils/resolve-effective-entity.util';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type PageLayoutWidgetForViewportValidation = Pick<
  UniversalFlatPageLayoutWidget,
  | 'universalIdentifier'
  | 'title'
  | 'type'
  | 'isActive'
  | 'position'
  | 'universalOverrides'
> & { pageLayoutTabUniversalIdentifier: string | null };

const isViewportFillingWidget = (
  widget: Pick<UniversalFlatPageLayoutWidget, 'type' | 'position'>,
): boolean => {
  return (
    getPageLayoutWidgetHeightBehavior({
      widgetType: widget.type,
      heightBehavior:
        widget.position?.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
          ? widget.position.heightBehavior
          : undefined,
    }) === PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT
  );
};

export const validateTabViewportConstraints = ({
  widget,
  pageLayoutTab,
  relatedWidgets,
}: {
  widget: PageLayoutWidgetForViewportValidation;
  pageLayoutTab: Pick<UniversalFlatPageLayoutTab, 'layoutMode'> | undefined;
  relatedWidgets: PageLayoutWidgetForViewportValidation[];
}): FlatEntityValidationError[] => {
  if (
    !widget.isActive ||
    pageLayoutTab?.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST
  ) {
    return [];
  }

  const isTabViewportWidget = isViewportFillingWidget(widget);

  const activeSiblingWidgets = relatedWidgets
    .filter(
      (relatedWidget) =>
        relatedWidget.pageLayoutTabUniversalIdentifier ===
          widget.pageLayoutTabUniversalIdentifier ||
        relatedWidget.universalOverrides?.pageLayoutTabUniversalIdentifier ===
          widget.pageLayoutTabUniversalIdentifier,
    )
    .map((relatedWidget) =>
      resolveEffectiveEntity({
        ...relatedWidget,
        overrides: relatedWidget.universalOverrides,
      }),
    )
    .filter(
      (relatedWidget) =>
        relatedWidget.universalIdentifier !== widget.universalIdentifier &&
        relatedWidget.isActive &&
        relatedWidget.pageLayoutTabUniversalIdentifier ===
          widget.pageLayoutTabUniversalIdentifier,
    );

  const errors: FlatEntityValidationError[] = [];
  const hasAnotherTabViewportWidget = activeSiblingWidgets.some(
    (siblingWidget) => isViewportFillingWidget(siblingWidget),
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

  if (widget.position?.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST) {
    return errors;
  }

  const widgetIndex = widget.position.index;
  const hasInvalidWidgetOrdering = activeSiblingWidgets.some(
    (siblingWidget) => {
      if (
        siblingWidget.position?.layoutMode !==
        PageLayoutTabLayoutMode.VERTICAL_LIST
      ) {
        return false;
      }

      const siblingIndex = siblingWidget.position.index;
      const isSiblingTabViewport = isViewportFillingWidget(siblingWidget);

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
};
