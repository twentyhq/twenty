import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetVerticalListPosition,
} from '@/types';
import {
  sortWidgetsWithViewportFillingLast,
  type WidgetWithHeightBehavior,
} from '@/utils/pageLayout/sortWidgetsWithViewportFillingLast';
import { isDefined } from '@/utils/validation/isDefined';

export const reindexWidgetsToVerticalListPositions = <
  TWidget extends WidgetWithHeightBehavior,
>(
  widgets: TWidget[],
): (Omit<TWidget, 'position'> & {
  position: PageLayoutWidgetVerticalListPosition;
})[] =>
  sortWidgetsWithViewportFillingLast(widgets).map((widget, index) => ({
    ...widget,
    position: {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
      ...(widget.position?.layoutMode ===
        PageLayoutTabLayoutMode.VERTICAL_LIST &&
      isDefined(widget.position.heightBehavior)
        ? { heightBehavior: widget.position.heightBehavior }
        : {}),
    },
  }));
