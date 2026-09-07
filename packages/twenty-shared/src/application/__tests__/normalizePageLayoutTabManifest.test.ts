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
  describe.each(['UNSUPPORTED', '', 42, {}])(
    'with invalid layoutMode %s in JSON input',
    (layoutMode) => {
      it.each([{ widgets: [] }, { widgets: [widget] }])(
        'returns a validation error with widgets $widgets',
        ({ widgets }) => {
          const pageLayoutTabManifest = JSON.parse(
            JSON.stringify({ ...tab, layoutMode, widgets }),
          );

          expect(
            normalizePageLayoutTabManifest({
              pageLayoutTabManifest,
              pageLayoutType: undefined,
            }),
          ).toEqual({
            status: 'fail',
            errors: [
              `Page layout tab "Details" defines unsupported layoutMode "${layoutMode}". Expected GRID, VERTICAL_LIST or CANVAS.`,
            ],
          });
        },
      );
    },
  );

  it('derives omitted positions and preserves explicit indices without changing its input', () => {
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
              index: 99,
              heightBehavior: 'TAB_VIEWPORT',
            },
          },
        ],
      },
    });
    expect(JSON.stringify(input)).toBe(original);
  });

  it('preserves a legacy nested height behavior and index', () => {
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
              index: 99,
              heightBehavior: 'TAB_VIEWPORT',
            },
          },
        ],
      },
    });
  });

  it('uses explicit indices rather than array order for legacy viewport placement', () => {
    const pageLayoutTabManifest: PageLayoutTabManifest = {
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
        {
          ...widget,
          universalIdentifier: 'second-widget',
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 2,
          },
        },
      ],
    };

    expect(
      normalizePageLayoutTabManifest({
        pageLayoutTabManifest,
        pageLayoutType: undefined,
      }),
    ).toEqual({
      status: 'success',
      pageLayoutTab: pageLayoutTabManifest,
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

  describe.each<{ name: string; viewport: Partial<PageLayoutWidgetManifest> }>([
    { name: 'explicit height', viewport: { heightBehavior: 'TAB_VIEWPORT' } },
    {
      name: 'legacy nested height',
      viewport: {
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        },
      },
    },
    {
      name: 'widget type default',
      viewport: {
        type: 'TIMELINE',
        configuration: { configurationType: 'TIMELINE' },
      },
    },
  ])('viewport constraints with $name', ({ viewport }) => {
    it.each([
      { duplicate: true, error: 'can contain only one TAB_VIEWPORT widget' },
      { duplicate: false, error: 'must place its TAB_VIEWPORT widget last' },
    ])('rejects a layout that $error', ({ duplicate, error }) => {
      expect(
        normalizePageLayoutTabManifest({
          pageLayoutTabManifest: {
            ...tab,
            widgets: [
              { ...widget, ...viewport },
              {
                ...widget,
                ...(duplicate ? viewport : {}),
                universalIdentifier: 'second-widget',
              },
            ],
          },
          pageLayoutType: undefined,
        }),
      ).toEqual({
        status: 'fail',
        errors: [`Page layout tab "Details" ${error}.`],
      });
    });
  });

  it('accepts an explicit fit-content override followed by a default viewport widget', () => {
    expect(
      normalizePageLayoutTabManifest({
        pageLayoutTabManifest: {
          ...tab,
          widgets: [
            {
              ...widget,
              type: 'TIMELINE',
              configuration: { configurationType: 'TIMELINE' },
              heightBehavior: 'FIT_CONTENT',
            },
            {
              ...widget,
              universalIdentifier: 'second-widget',
              type: 'TIMELINE',
              configuration: { configurationType: 'TIMELINE' },
            },
          ],
        },
        pageLayoutType: undefined,
      }),
    ).toMatchObject({ status: 'success' });
  });

  it.each([PageLayoutTabLayoutMode.GRID, PageLayoutTabLayoutMode.CANVAS])(
    'rejects a vertical-list position in an authored %s tab',
    (layoutMode) => {
      expect(
        normalizePageLayoutTabManifest({
          pageLayoutTabManifest: {
            ...tab,
            layoutMode,
            widgets: [
              {
                ...widget,
                position: {
                  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                  index: 0,
                },
              },
              { ...widget, universalIdentifier: 'second-widget' },
            ],
          },
          pageLayoutType: undefined,
        }),
      ).toEqual({
        status: 'fail',
        errors: [
          `Page layout widget "App" uses a VERTICAL_LIST position, but its parent tab "Details" uses ${layoutMode}.`,
        ],
      });
    },
  );

  it('rejects a conflicting grid position instead of changing its layout', () => {
    expect(
      normalizePageLayoutTabManifest({
        pageLayoutTabManifest: {
          ...tab,
          widgets: [
            {
              ...widget,
              position: {
                layoutMode: PageLayoutTabLayoutMode.GRID,
                row: 0,
                column: 0,
                rowSpan: 1,
                columnSpan: 12,
              },
            },
          ],
        },
        pageLayoutType: undefined,
      }),
    ).toMatchObject({
      status: 'fail',
      errors: [
        'Page layout widget "App" uses a GRID position, but its parent tab "Details" uses VERTICAL_LIST.',
      ],
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
    {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 1,
      column: 2,
      rowSpan: 3,
      columnSpan: 4,
    },
    { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
  ])(
    'rejects a conflicting position %j on a single-widget Canvas tab',
    (position) => {
      expect(
        normalizePageLayoutTabManifest({
          pageLayoutTabManifest: {
            ...tab,
            layoutMode: PageLayoutTabLayoutMode.CANVAS,
            widgets: [{ ...widget, position }],
          },
          pageLayoutType: undefined,
        }),
      ).toEqual({
        status: 'fail',
        errors: [
          `Page layout widget "App" uses a ${position?.layoutMode} position, but its parent tab "Details" uses CANVAS.`,
        ],
      });
    },
  );

  it.each<PageLayoutWidgetManifest['position']>([
    undefined,
    { layoutMode: PageLayoutTabLayoutMode.CANVAS },
  ])('preserves single-widget Canvas with position %s', (position) => {
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
        layoutMode: 'CANVAS',
        widgets: [
          {
            position: {
              layoutMode: 'CANVAS',
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
