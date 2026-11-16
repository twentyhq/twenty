import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from '@/types';
import { reindexWidgetsToVerticalListPositions } from '@/utils/pageLayout/reindexWidgetsToVerticalListPositions';

describe('reindexWidgetsToVerticalListPositions', () => {
  it('preserves explicit height overrides while renumbering stable groups', () => {
    const widgets = [
      {
        id: 'component',
        type: WidgetType.FRONT_COMPONENT,
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 7,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        },
      },
      {
        id: 'timeline',
        type: WidgetType.TIMELINE,
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 4,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
        },
      },
      { id: 'fields', type: WidgetType.FIELDS, position: null },
      { id: 'emails', type: WidgetType.EMAILS },
    ];
    const result = reindexWidgetsToVerticalListPositions(widgets);

    expect(result.map(({ id }) => id)).toEqual([
      'timeline',
      'fields',
      'component',
      'emails',
    ]);
    expect(result.map(({ position }) => position.index)).toEqual([0, 1, 2, 3]);
    expect(result[0]?.position.heightBehavior).toBe(
      PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
    );
    expect(result[2]?.position.heightBehavior).toBe(
      PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    );
    expect(result[3]?.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 3,
    });
    expect(widgets[0]?.position?.index).toBe(7);
  });

  it('converts grid positions without retaining grid coordinates', () => {
    expect(
      reindexWidgetsToVerticalListPositions([
        {
          id: 'component',
          title: 'Company overview',
          type: WidgetType.FRONT_COMPONENT,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 3,
            column: 2,
            rowSpan: 4,
            columnSpan: 6,
          },
        },
      ]),
    ).toEqual([
      {
        id: 'component',
        title: 'Company overview',
        type: WidgetType.FRONT_COMPONENT,
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 0,
        },
      },
    ]);
  });
});
