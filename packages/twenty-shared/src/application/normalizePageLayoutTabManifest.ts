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
  isPlainObject,
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
    const heightBehaviors = [
      widget.heightBehavior,
      isPlainObject(widget.position) && 'heightBehavior' in widget.position
        ? widget.position.heightBehavior
        : undefined,
    ].filter(isDefined);

    if (
      heightBehaviors.length > 0 &&
      layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST
    ) {
      errors.push(
        `Page layout widget "${widget.title}" defines heightBehavior, but its parent tab "${pageLayoutTabManifest.title}" uses ${layoutMode}. heightBehavior is only supported for VERTICAL_LIST tabs.`,
      );
    }

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

  const pageLayoutTab: NormalizedPageLayoutTabManifest = {
    ...pageLayoutTabManifest,
    layoutMode,
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
        if (isDefined(position)) {
          return {
            ...widget,
            position:
              position.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
              isDefined(heightBehavior)
                ? {
                    ...position,
                    heightBehavior:
                      PageLayoutWidgetVerticalListHeightBehavior[
                        heightBehavior
                      ],
                  }
                : position,
          };
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

        switch (layoutMode) {
          case PageLayoutTabLayoutMode.GRID:
            return {
              ...widget,
              position: {
                layoutMode,
                row: 0,
                column: 0,
                rowSpan: DEFAULT_WIDGET_SIZE.default.h,
                columnSpan: DEFAULT_WIDGET_SIZE.default.w,
              },
            };
          case PageLayoutTabLayoutMode.VERTICAL_LIST:
            return {
              ...widget,
              position: {
                layoutMode,
                index,
                ...(isDefined(heightBehavior)
                  ? {
                      heightBehavior:
                        PageLayoutWidgetVerticalListHeightBehavior[
                          heightBehavior
                        ],
                    }
                  : {}),
              },
            };
          case PageLayoutTabLayoutMode.CANVAS:
            return {
              ...widget,
              position: { layoutMode },
            };
          default:
            return assertUnreachable(layoutMode);
        }
      },
    ),
  };

  for (const widget of pageLayoutTab.widgets) {
    if (widget.position.layoutMode !== layoutMode) {
      errors.push(
        `Page layout widget "${widget.title}" uses a ${widget.position.layoutMode} position, but its parent tab "${pageLayoutTab.title}" uses ${layoutMode}.`,
      );
    }
  }

  if (layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST) {
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
      pageLayoutTab.widgets.some(
        (widget) =>
          widget !== viewportWidgets[0] &&
          widget.position.layoutMode ===
            PageLayoutTabLayoutMode.VERTICAL_LIST &&
          viewportWidgets[0].position.layoutMode ===
            PageLayoutTabLayoutMode.VERTICAL_LIST &&
          widget.position.index >= viewportWidgets[0].position.index,
      )
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
