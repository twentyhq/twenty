import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from 'twenty-shared/types';

import { getVerticalListWidgetInsertionPositions } from 'src/engine/metadata-modules/page-layout-widget/utils/get-vertical-list-widget-insertion-positions.util';

const buildWidget = ({
  id,
  index,
  type = WidgetType.FRONT_COMPONENT,
  heightBehavior,
}: {
  id: string;
  index: number;
  type?: WidgetType;
  heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior;
}) => ({
  id,
  type,
  position: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST as const,
    index,
    ...(heightBehavior ? { heightBehavior } : {}),
  },
});

describe('getVerticalListWidgetInsertionPositions', () => {
  it.each([
    { index: 0, expected: ['new', 'a', 'b'] },
    { index: 1, expected: ['a', 'new', 'b'] },
    { index: 2, expected: ['a', 'b', 'new'] },
  ])(
    'inserts at $index and keeps unique contiguous positions',
    ({ index, expected }) => {
      const widgets = [
        buildWidget({ id: 'a', index: 0 }),
        buildWidget({ id: 'b', index: 1 }),
      ];
      const result = getVerticalListWidgetInsertionPositions({
        widgets,
        widgetToCreate: buildWidget({ id: 'new', index }),
      });
      expect(result.map(({ id }) => id)).toEqual(expected);
      expect(result.map(({ position }) => position.index)).toEqual([0, 1, 2]);
      expect(widgets.map(({ position }) => position.index)).toEqual([0, 1]);
    },
  );
  it.each([WidgetType.TIMELINE, WidgetType.FRONT_COMPONENT])(
    'keeps a viewport-filling %s widget last',
    (type) => {
      const result = getVerticalListWidgetInsertionPositions({
        widgets: [
          buildWidget({
            id: 'full',
            index: 0,
            type,
            heightBehavior:
              PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
          }),
        ],
        widgetToCreate: buildWidget({ id: 'new', index: 1 }),
      });
      expect(result).toEqual([
        {
          id: 'new',
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
        },
        {
          id: 'full',
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 1,
            heightBehavior:
              PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
          },
        },
      ]);
    },
  );
  it('honors the default viewport height of a timeline widget', () => {
    const result = getVerticalListWidgetInsertionPositions({
      widgets: [
        buildWidget({ id: 'full', index: 0, type: WidgetType.TIMELINE }),
      ],
      widgetToCreate: buildWidget({ id: 'new', index: 1 }),
    });
    expect(result.map(({ id }) => id)).toEqual(['new', 'full']);
  });
  it('sorts existing positions and clamps an index beyond the list', () => {
    const result = getVerticalListWidgetInsertionPositions({
      widgets: [
        buildWidget({ id: 'b', index: 4 }),
        buildWidget({ id: 'a', index: 2 }),
      ],
      widgetToCreate: buildWidget({ id: 'new', index: 20 }),
    });
    expect(result.map(({ id }) => id)).toEqual(['a', 'b', 'new']);
    expect(result.map(({ position }) => position.index)).toEqual([0, 1, 2]);
  });
});
