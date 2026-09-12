import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from 'twenty-shared/types';

import { validateTabViewportConstraints } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-tab-viewport-constraints.util';
import { resolveEffectiveEntity } from 'src/engine/metadata-modules/utils/resolve-effective-entity.util';

type ViewportWidget = Parameters<
  typeof validateTabViewportConstraints
>[0]['widget'];

const TAB_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000001';

const buildWidget = ({
  universalIdentifier,
  index,
  heightBehavior,
  type = WidgetType.FRONT_COMPONENT,
}: {
  universalIdentifier: string;
  index: number;
  heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior;
  type?: WidgetType;
}): ViewportWidget => ({
  universalIdentifier,
  title: universalIdentifier,
  type,
  isActive: true,
  pageLayoutTabUniversalIdentifier: TAB_UNIVERSAL_IDENTIFIER,
  universalOverrides: null,
  position: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index,
    heightBehavior,
  },
});

describe('validateTabViewportConstraints', () => {
  const validate = ({
    widget,
    siblingWidgets = [],
  }: {
    widget: ViewportWidget;
    siblingWidgets?: ViewportWidget[];
  }) =>
    validateTabViewportConstraints({
      widget: resolveEffectiveEntity({
        ...widget,
        overrides: widget.universalOverrides,
      }),
      relatedWidgets: siblingWidgets,
      pageLayoutTab: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST },
    });

  it('rejects a second active TAB_VIEWPORT widget in the same tab', () => {
    const result = validate({
      widget: buildWidget({
        universalIdentifier: 'viewport-2',
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'viewport-1',
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ],
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'only one active TAB_VIEWPORT widget',
          ),
        }),
      ]),
    );
  });

  it('treats a legacy viewport-filling widget type as TAB_VIEWPORT', () => {
    const result = validate({
      widget: buildWidget({
        universalIdentifier: 'viewport',
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'legacy-viewport',
          index: 0,
          type: WidgetType.TIMELINE,
        }),
      ],
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'only one active TAB_VIEWPORT widget',
          ),
        }),
      ]),
    );
  });

  it.each(['base', 'override'] as const)(
    'counts a Timeline with a null %s position as a viewport widget',
    (positionSource) => {
      const timeline = buildWidget({
        universalIdentifier: 'timeline',
        index: 0,
        type: WidgetType.TIMELINE,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
      });
      const result = validate({
        widget: buildWidget({
          universalIdentifier: 'viewport',
          index: 1,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
        siblingWidgets: [
          {
            ...timeline,
            ...(positionSource === 'base'
              ? { position: null }
              : { universalOverrides: { position: null } }),
          },
        ],
      });

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(
              'only one active TAB_VIEWPORT widget',
            ),
          }),
        ]),
      );
    },
  );

  it.each(['base', 'override'] as const)(
    'does not infer an order for a Timeline with a null %s position',
    (positionSource) => {
      const timeline = {
        ...buildWidget({
          universalIdentifier: 'timeline',
          index: 0,
          type: WidgetType.TIMELINE,
        }),
        ...(positionSource === 'base'
          ? { position: null }
          : { universalOverrides: { position: null } }),
      };
      const fitContentWidget = buildWidget({
        universalIdentifier: 'fit-content',
        index: 1,
      });

      const timelineResult = validate({
        widget: timeline,
        siblingWidgets: [fitContentWidget],
      });
      const fitContentResult = validate({
        widget: fitContentWidget,
        siblingWidgets: [timeline],
      });

      expect(timelineResult).toEqual([]);
      expect(fitContentResult).toEqual([]);
    },
  );

  it('rejects a new Timeline with no position when the tab already has a viewport widget', () => {
    const result = validate({
      widget: {
        ...buildWidget({
          universalIdentifier: 'timeline',
          index: 0,
          type: WidgetType.TIMELINE,
        }),
        position: null,
      },
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'viewport',
          index: 1,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ],
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'only one active TAB_VIEWPORT widget',
          ),
        }),
      ]),
    );
  });

  it.each([true, false])(
    'checks the effective tab of an overridden viewport widget (moved into tab: %s)',
    (isMovedIntoTab) => {
      const otherTabUniversalIdentifier =
        '00000000-0000-4000-8000-000000000002';
      const result = validate({
        widget: buildWidget({
          universalIdentifier: 'viewport',
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
        siblingWidgets: [
          {
            ...buildWidget({
              universalIdentifier: 'moved-viewport',
              index: 1,
              heightBehavior:
                PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
            }),
            pageLayoutTabUniversalIdentifier: isMovedIntoTab
              ? otherTabUniversalIdentifier
              : TAB_UNIVERSAL_IDENTIFIER,
            universalOverrides: {
              pageLayoutTabUniversalIdentifier: isMovedIntoTab
                ? TAB_UNIVERSAL_IDENTIFIER
                : otherTabUniversalIdentifier,
            },
          },
        ],
      });

      expect(result).toHaveLength(isMovedIntoTab ? 1 : 0);
    },
  );

  it('ignores a viewport widget explicitly detached from its original tab', () => {
    const result = validate({
      widget: buildWidget({
        universalIdentifier: 'replacement',
        index: 0,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        {
          ...buildWidget({
            universalIdentifier: 'detached',
            index: 0,
            heightBehavior:
              PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
          }),
          universalOverrides: { pageLayoutTabUniversalIdentifier: null },
        },
      ],
    });

    expect(result).toEqual([]);
  });

  it('orders fit-content widgets before legacy viewport-filling widget types', () => {
    const result = validate({
      widget: buildWidget({
        universalIdentifier: 'fit-content',
        index: 1,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'legacy-viewport',
          index: 0,
          type: WidgetType.TIMELINE,
        }),
      ],
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'must be ordered after fit-content widgets',
          ),
        }),
      ]),
    );
  });

  it('rejects TAB_VIEWPORT before an active fit-content widget', () => {
    const result = validate({
      widget: buildWidget({
        universalIdentifier: 'viewport',
        index: 0,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'fit-content',
          index: 1,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
        }),
      ],
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'must be ordered after fit-content widgets',
          ),
        }),
      ]),
    );
  });

  it('rejects a fit-content widget inserted after TAB_VIEWPORT', () => {
    const result = validate({
      widget: buildWidget({
        universalIdentifier: 'fit-content',
        index: 1,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'viewport',
          index: 0,
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
        }),
      ],
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            'must be ordered after fit-content widgets',
          ),
        }),
      ]),
    );
  });

  it('accepts one trailing TAB_VIEWPORT widget', () => {
    const result = validate({
      widget: buildWidget({
        universalIdentifier: 'viewport',
        index: 1,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      }),
      siblingWidgets: [
        buildWidget({
          universalIdentifier: 'fit-content',
          index: 0,
        }),
      ],
    });

    expect(result).toEqual([]);
  });

  it('ignores an inactive viewport widget', () => {
    expect(
      validate({
        widget: {
          ...buildWidget({
            universalIdentifier: 'inactive',
            index: 0,
            heightBehavior:
              PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
          }),
          isActive: false,
        },
        siblingWidgets: [
          buildWidget({ universalIdentifier: 'content', index: 1 }),
        ],
      }),
    ).toEqual([]);
  });

  it('ignores an inactive viewport sibling', () => {
    expect(
      validate({
        widget: buildWidget({ universalIdentifier: 'content', index: 1 }),
        siblingWidgets: [
          {
            ...buildWidget({
              universalIdentifier: 'inactive',
              index: 0,
              heightBehavior:
                PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
            }),
            isActive: false,
          },
        ],
      }),
    ).toEqual([]);
  });

  it.each([PageLayoutTabLayoutMode.GRID, PageLayoutTabLayoutMode.CANVAS])(
    'does not apply viewport constraints to %s tabs',
    (layoutMode) => {
      expect(
        validateTabViewportConstraints({
          widget: buildWidget({
            universalIdentifier: 'viewport',
            index: 0,
            heightBehavior:
              PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
          }),
          relatedWidgets: [
            buildWidget({ universalIdentifier: 'content', index: 1 }),
          ],
          pageLayoutTab: { layoutMode },
        }),
      ).toEqual([]);
    },
  );
});
