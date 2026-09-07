import {
  type NormalizedPageLayoutTabManifest,
  type NormalizedPageLayoutWidgetManifest,
} from '@/application/normalizedPageLayoutManifestType';
import {
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
} from '@/application/pageLayoutManifestType';
import { DEFAULT_WIDGET_SIZE } from '@/constants';
import {
  type GridPosition,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from '@/types';
import {
  assertUnreachable,
  getPageLayoutWidgetHeightBehavior,
  isDefined,
} from '@/utils';

export const normalizePageLayoutTabManifest = ({
  pageLayoutTabManifest,
  pageLayoutType,
}: {
  pageLayoutTabManifest: PageLayoutTabManifest;
  pageLayoutType: PageLayoutManifest['type'] | undefined;
}):
  | { status: 'success'; pageLayoutTab: NormalizedPageLayoutTabManifest }
  | { status: 'fail'; errors: string[] } => {
  const layoutMode =
    pageLayoutTabManifest.layoutMode ??
    (pageLayoutType === PageLayoutType.STANDALONE_PAGE
      ? PageLayoutTabLayoutMode.VERTICAL_LIST
      : PageLayoutTabLayoutMode.GRID);
  const widgets = pageLayoutTabManifest.widgets ?? [];
  const errors: string[] = [];

  if (
    !Object.values(PageLayoutTabLayoutMode).some(
      (supportedLayoutMode) => supportedLayoutMode === layoutMode,
    )
  ) {
    return {
      status: 'fail',
      errors: [
        `Page layout tab "${pageLayoutTabManifest.title}" defines unsupported layoutMode "${layoutMode}". Expected GRID, VERTICAL_LIST or CANVAS.`,
      ],
    };
  }

  for (const widget of widgets) {
    if (
      isDefined(widget.heightBehavior) &&
      layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST
    ) {
      errors.push(
        `Page layout widget "${widget.title}" defines heightBehavior, but its parent tab "${pageLayoutTabManifest.title}" uses ${layoutMode}. heightBehavior is only supported for VERTICAL_LIST tabs.`,
      );
    }

    const heightBehaviors = [
      widget.heightBehavior,
      widget.position?.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
        ? widget.position.heightBehavior
        : undefined,
    ].filter(isDefined);

    for (const heightBehavior of heightBehaviors) {
      if (
        !Object.values(PageLayoutWidgetVerticalListHeightBehavior).some(
          (supportedHeightBehavior) =>
            supportedHeightBehavior === heightBehavior,
        )
      ) {
        errors.push(
          `Page layout widget "${widget.title}" defines unsupported heightBehavior "${heightBehavior}". Expected FIT_CONTENT or TAB_VIEWPORT.`,
        );
      }
    }
  }

  if (errors.length > 0) {
    return { status: 'fail', errors };
  }

  const isLegacyCanvasTab =
    layoutMode === PageLayoutTabLayoutMode.CANVAS && widgets.length === 1;

  const normalizedLayoutMode = isLegacyCanvasTab
    ? PageLayoutTabLayoutMode.VERTICAL_LIST
    : layoutMode;

  const pageLayoutTab: NormalizedPageLayoutTabManifest = {
    ...pageLayoutTabManifest,
    layoutMode: normalizedLayoutMode,
    widgets: widgets.map(
      (
        {
          heightBehavior,
          position,
          gridPosition,
          ...widget
        }: PageLayoutWidgetManifest & { gridPosition?: GridPosition },
        index,
      ): NormalizedPageLayoutWidgetManifest => {
        if (normalizedLayoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST) {
          const resolvedHeightBehavior = isLegacyCanvasTab
            ? PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT
            : (heightBehavior ??
              (position?.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
                ? position.heightBehavior
                : undefined));

          return {
            ...widget,
            position: {
              layoutMode: normalizedLayoutMode,
              index,
              ...(isDefined(resolvedHeightBehavior)
                ? {
                    heightBehavior:
                      PageLayoutWidgetVerticalListHeightBehavior[
                        resolvedHeightBehavior
                      ],
                  }
                : {}),
            },
          };
        }

        if (isDefined(position)) {
          return { ...widget, position };
        }

        if (isDefined(gridPosition)) {
          return {
            ...widget,
            position: {
              layoutMode: PageLayoutTabLayoutMode.GRID,
              ...gridPosition,
            },
          };
        }

        switch (normalizedLayoutMode) {
          case PageLayoutTabLayoutMode.GRID:
            return {
              ...widget,
              position: {
                layoutMode: normalizedLayoutMode,
                row: 0,
                column: 0,
                rowSpan: DEFAULT_WIDGET_SIZE.default.h,
                columnSpan: DEFAULT_WIDGET_SIZE.default.w,
              },
            };
          case PageLayoutTabLayoutMode.CANVAS:
            return {
              ...widget,
              position: { layoutMode: normalizedLayoutMode },
            };
          default:
            return assertUnreachable(normalizedLayoutMode);
        }
      },
    ),
  };

  for (const widget of pageLayoutTab.widgets) {
    if (widget.position.layoutMode !== normalizedLayoutMode) {
      errors.push(
        `Page layout widget "${widget.title}" uses a ${widget.position.layoutMode} position, but its parent tab "${pageLayoutTab.title}" uses ${normalizedLayoutMode}.`,
      );
    }
  }

  if (normalizedLayoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST) {
    const viewportWidgets = pageLayoutTab.widgets.filter(
      ({ type, position }) =>
        position.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
        getPageLayoutWidgetHeightBehavior({
          widgetType: WidgetType[type],
          heightBehavior: position.heightBehavior,
        }) === PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    );

    if (viewportWidgets.length > 1) {
      errors.push(
        `Page layout tab "${pageLayoutTab.title}" can contain only one TAB_VIEWPORT widget.`,
      );
    }

    if (
      viewportWidgets.length === 1 &&
      viewportWidgets[0] !==
        pageLayoutTab.widgets[pageLayoutTab.widgets.length - 1]
    ) {
      errors.push(
        `Page layout tab "${pageLayoutTab.title}" must place its TAB_VIEWPORT widget last.`,
      );
    }
  }

  if (errors.length > 0) {
    return { status: 'fail', errors };
  }

  return { status: 'success', pageLayoutTab };
};
