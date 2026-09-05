import { normalizePageLayoutTabManifest } from '../normalizePageLayoutTabManifest';
import {
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
} from '../pageLayoutManifestType';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  PageLayoutWidgetVerticalListHeightBehavior,
} from '../../types';
import { DEFAULT_WIDGET_SIZE } from '../../constants';

const widget: PageLayoutWidgetManifest = {
  universalIdentifier: 'widget',
  title: 'App',
  type: 'FRONT_COMPONENT',
  configuration: {
    configurationType: 'FRONT_COMPONENT',
    frontComponentUniversalIdentifier: 'component',
  },
};
const tab: PageLayoutTabManifest = {
  universalIdentifier: 'tab',
  title: 'Details',
  position: 0,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [widget],
};

describe('normalizePageLayoutTabManifest', () => {
  it('derives layout and widget order without changing its input', () => {
    const input: PageLayoutTabManifest = {
      ...tab,
      widgets: [
        { ...widget, heightBehavior: 'FIT_CONTENT' as const },
        {
          ...widget,
          universalIdentifier: 'second-widget',
          heightBehavior: 'TAB_VIEWPORT' as const,
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 99,
            heightBehavior:
              PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
          },
        },
      ],
    };
    const original = JSON.stringify(input);
    const result = normalizePageLayoutTabManifest({
      pageLayoutTabManifest: input,
      pageLayoutType: 'RECORD_PAGE',
    });

    expect(result).toEqual({
      status: 'success',
      pageLayoutTab: {
        ...tab,
        widgets: [
          {
            ...widget,
            position: {
              layoutMode: 'VERTICAL_LIST',
              index: 0,
              heightBehavior: 'FIT_CONTENT',
            },
          },
          {
            ...widget,
            universalIdentifier: 'second-widget',
            position: {
              layoutMode: 'VERTICAL_LIST',
              index: 1,
              heightBehavior: 'TAB_VIEWPORT',
            },
          },
        ],
      },
    });
    expect(JSON.stringify(input)).toBe(original);
  });

  it('preserves a legacy nested height behavior and replaces its index', () => {
    const result = normalizePageLayoutTabManifest({
      pageLayoutTabManifest: {
        ...tab,
        widgets: [
          {
            ...widget,
            position: {
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
              index: 99,
              heightBehavior:
                PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
            },
          },
        ],
      },
      pageLayoutType: undefined,
    });

    expect(result).toMatchObject({
      status: 'success',
      pageLayoutTab: {
        widgets: [
          {
            position: {
              layoutMode: 'VERTICAL_LIST',
              index: 0,
              heightBehavior: 'TAB_VIEWPORT',
            },
          },
        ],
      },
    });
  });

  it('keeps omitted height behavior implicit', () => {
    expect(
      normalizePageLayoutTabManifest({
        pageLayoutTabManifest: tab,
        pageLayoutType: undefined,
      }),
    ).toEqual({
      status: 'success',
      pageLayoutTab: {
        ...tab,
        widgets: [
          { ...widget, position: { layoutMode: 'VERTICAL_LIST', index: 0 } },
        ],
      },
    });
  });

  it.each([
    undefined,
    PageLayoutType.DASHBOARD,
    PageLayoutType.RECORD_PAGE,
    PageLayoutType.STANDALONE_PAGE,
  ])('resolves omitted layout mode for page type %s', (pageLayoutType) => {
    const result = normalizePageLayoutTabManifest({
      pageLayoutTabManifest: {
        ...tab,
        layoutMode: undefined,
        widgets: undefined,
      },
      pageLayoutType,
    });
    expect(result).toMatchObject({
      status: 'success',
      pageLayoutTab: {
        layoutMode:
          pageLayoutType === PageLayoutType.STANDALONE_PAGE
            ? 'VERTICAL_LIST'
            : 'GRID',
        widgets: [],
      },
    });
  });

  it('keeps an explicit grid mode and supplies its default position', () => {
    expect(
      normalizePageLayoutTabManifest({
        pageLayoutTabManifest: {
          ...tab,
          layoutMode: PageLayoutTabLayoutMode.GRID,
        },
        pageLayoutType: 'STANDALONE_PAGE',
      }),
    ).toMatchObject({
      status: 'success',
      pageLayoutTab: {
        layoutMode: 'GRID',
        widgets: [
          {
            position: {
              layoutMode: 'GRID',
              row: 0,
              column: 0,
              rowSpan: DEFAULT_WIDGET_SIZE.default.h,
              columnSpan: DEFAULT_WIDGET_SIZE.default.w,
            },
          },
        ],
      },
    });
  });

  it.each(['position', 'gridPosition'])(
    'preserves legacy grid coordinates in %s',
    (positionKey) => {
      const gridPosition = { row: 2, column: 6, rowSpan: 4, columnSpan: 6 };
      const result = normalizePageLayoutTabManifest({
        pageLayoutTabManifest: {
          ...tab,
          layoutMode: PageLayoutTabLayoutMode.GRID,
          widgets: [
            {
              ...widget,
              [positionKey]:
                positionKey === 'position'
                  ? {
                      layoutMode: PageLayoutTabLayoutMode.GRID,
                      ...gridPosition,
                    }
                  : gridPosition,
            },
          ],
        },
        pageLayoutType: undefined,
      });
      expect(result).toEqual({
        status: 'success',
        pageLayoutTab: {
          ...tab,
          layoutMode: 'GRID',
          widgets: [
            { ...widget, position: { layoutMode: 'GRID', ...gridPosition } },
          ],
        },
      });
    },
  );

  it.each<PageLayoutWidgetManifest['position']>([
    undefined,
    { layoutMode: PageLayoutTabLayoutMode.CANVAS },
  ])('converts single-widget Canvas with position %s', (position) => {
    const result = normalizePageLayoutTabManifest({
      pageLayoutTabManifest: {
        ...tab,
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
        widgets: [{ ...widget, position }],
      },
      pageLayoutType: undefined,
    });
    expect(result).toMatchObject({
      status: 'success',
      pageLayoutTab: {
        layoutMode: 'VERTICAL_LIST',
        widgets: [
          {
            position: {
              layoutMode: 'VERTICAL_LIST',
              index: 0,
              heightBehavior: 'TAB_VIEWPORT',
            },
          },
        ],
      },
    });
  });

  it.each([0, 2])(
    'keeps a Canvas tab with %i widgets unchanged',
    (widgetCount) => {
      const result = normalizePageLayoutTabManifest({
        pageLayoutTabManifest: {
          ...tab,
          layoutMode: PageLayoutTabLayoutMode.CANVAS,
          widgets: Array.from({ length: widgetCount }, (_, index) => ({
            ...widget,
            universalIdentifier: `widget-${index}`,
          })),
        },
        pageLayoutType: undefined,
      });
      expect(result).toMatchObject({
        status: 'success',
        pageLayoutTab: {
          layoutMode: 'CANVAS',
          widgets: Array.from({ length: widgetCount }, () => ({
            position: { layoutMode: 'CANVAS' },
          })),
        },
      });
    },
  );

  it.each([PageLayoutTabLayoutMode.GRID, PageLayoutTabLayoutMode.CANVAS])(
    'rejects heightBehavior on authored %s before normalization',
    (layoutMode) => {
      expect(
        normalizePageLayoutTabManifest({
          pageLayoutTabManifest: {
            ...tab,
            layoutMode,
            widgets: [{ ...widget, heightBehavior: 'TAB_VIEWPORT' }],
          },
          pageLayoutType: undefined,
        }),
      ).toEqual({
        status: 'fail',
        errors: [
          `Page layout widget "App" defines heightBehavior, but its parent tab "Details" uses ${layoutMode}. heightBehavior is only supported for VERTICAL_LIST tabs.`,
        ],
      });
    },
  );

  it.each(['TAB_VIEPORT', '', 42, {}])(
    'rejects invalid heightBehavior %s in JSON input',
    (heightBehavior) => {
      const pageLayoutTabManifest = JSON.parse(
        JSON.stringify({ ...tab, widgets: [{ ...widget, heightBehavior }] }),
      );
      expect(
        normalizePageLayoutTabManifest({
          pageLayoutTabManifest,
          pageLayoutType: undefined,
        }),
      ).toEqual({
        status: 'fail',
        errors: [
          `Page layout widget "App" defines unsupported heightBehavior "${heightBehavior}". Expected FIT_CONTENT or TAB_VIEWPORT.`,
        ],
      });
    },
  );

  it('rejects an invalid nested height behavior', () => {
    const pageLayoutTabManifest = JSON.parse(
      JSON.stringify({
        ...tab,
        widgets: [
          {
            ...widget,
            position: {
              layoutMode: 'VERTICAL_LIST',
              index: 0,
              heightBehavior: 'INVALID',
            },
          },
        ],
      }),
    );
    expect(
      normalizePageLayoutTabManifest({
        pageLayoutTabManifest,
        pageLayoutType: undefined,
      }),
    ).toMatchObject({
      status: 'fail',
      errors: [expect.stringContaining('unsupported heightBehavior "INVALID"')],
    });
  });
});
