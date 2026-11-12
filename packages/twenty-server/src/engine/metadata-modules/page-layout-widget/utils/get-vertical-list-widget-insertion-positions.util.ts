import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetVerticalListPosition,
} from 'twenty-shared/types';
import { reindexWidgetsToVerticalListPositions } from 'twenty-shared/utils';

import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';

type PositionedWidget = Pick<PageLayoutWidgetDTO, 'id' | 'type'> & {
  position: PageLayoutWidgetVerticalListPosition;
};

export const getVerticalListWidgetInsertionPositions = ({
  widgets,
  widgetToCreate,
}: {
  widgets: Pick<PageLayoutWidgetDTO, 'id' | 'type' | 'position'>[];
  widgetToCreate: PositionedWidget;
}): { id: string; position: PageLayoutWidgetVerticalListPosition }[] => {
  const orderedWidgets = widgets
    .flatMap(({ id, type, position }) =>
      position?.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
        ? [{ id, type, position }]
        : [],
    )
    .sort((first, second) => first.position.index - second.position.index);

  orderedWidgets.splice(widgetToCreate.position.index, 0, widgetToCreate);
  return reindexWidgetsToVerticalListPositions(orderedWidgets).map(
    ({ id, position }) => ({ id, position }),
  );
};
