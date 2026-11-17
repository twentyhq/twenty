import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
  type WidgetType,
} from '@/types';
import { getPageLayoutWidgetHeightBehavior } from '@/utils/pageLayout/getPageLayoutWidgetHeightBehavior';

export type WidgetWithHeightBehavior = {
  type: WidgetType;
  position?: {
    layoutMode: PageLayoutTabLayoutMode;
    heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior | null;
  } | null;
};

export const sortWidgetsWithViewportFillingLast = <
  TWidget extends WidgetWithHeightBehavior,
>(
  widgets: TWidget[],
): TWidget[] => {
  const fillsViewport = (widget: TWidget) =>
    getPageLayoutWidgetHeightBehavior({
      widgetType: widget.type,
      heightBehavior:
        widget.position?.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
          ? widget.position.heightBehavior
          : undefined,
    }) === PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT;

  return [
    ...widgets.filter((widget) => !fillsViewport(widget)),
    ...widgets.filter(fillsViewport),
  ];
};
