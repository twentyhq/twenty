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
} from '@/types';
import { assertUnreachable, isDefined } from '@/utils';

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

  return {
    status: 'success',
    pageLayoutTab: {
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
    },
  };
};
