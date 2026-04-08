import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';

export const sortWidgetDtosByPosition = (
  widgets: PageLayoutWidgetDTO[],
): PageLayoutWidgetDTO[] => {
  return [...widgets].sort((widgetA, widgetB) => {
    const positionA = widgetA.position;
    const positionB = widgetB.position;

    if (!positionA || !positionB) return 0;

    if ('index' in positionA && 'index' in positionB) {
      return positionA.index - positionB.index;
    }

    if ('row' in positionA && 'row' in positionB) {
      if (positionA.row !== positionB.row) {
        return positionA.row - positionB.row;
      }

      if ('column' in positionA && 'column' in positionB) {
        return positionA.column - positionB.column;
      }
    }

    return 0;
  });
};
