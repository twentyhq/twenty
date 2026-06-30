import { NavigationMenuItemType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { validateNavigationMenuItemPageLayoutReferenceCrossEntity } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-page-layout-reference-cross-entity.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

const NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '00000000-0000-0000-0000-000000000001';
const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER = '00000000-0000-0000-0000-0000000000aa';
const MISSING_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  '00000000-0000-0000-0000-0000000000bb';

const mapsFrom = (entities: { universalIdentifier: string }[]): any => {
  const maps = createEmptyFlatEntityMaps() as any;

  for (const entity of entities) {
    maps.byUniversalIdentifier[entity.universalIdentifier] = entity;
  }

  return maps;
};

const pageLayout = (
  type: PageLayoutType,
  universalIdentifier = PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
) => ({
  universalIdentifier,
  type,
});

const navigationMenuItem = (
  pageLayoutUniversalIdentifier: string | null,
  universalIdentifier = NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
) => ({
  universalIdentifier,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier,
});

const emptyActions = () => ({ create: [], update: [], delete: [] });

const reportFrom = ({
  createdNavigationMenuItemUniversalIdentifiers = [],
  updatedNavigationMenuItemUniversalIdentifiers = [],
  createdPageLayoutUniversalIdentifiers = [],
  updatedPageLayoutUniversalIdentifiers = [],
}: {
  createdNavigationMenuItemUniversalIdentifiers?: string[];
  updatedNavigationMenuItemUniversalIdentifiers?: string[];
  createdPageLayoutUniversalIdentifiers?: string[];
  updatedPageLayoutUniversalIdentifiers?: string[];
}): any => ({
  navigationMenuItem: {
    ...emptyActions(),
    create: createdNavigationMenuItemUniversalIdentifiers.map(
      (universalIdentifier) => ({ flatEntity: { universalIdentifier } }),
    ),
    update: updatedNavigationMenuItemUniversalIdentifiers.map(
      (universalIdentifier) => ({ universalIdentifier }),
    ),
  },
  pageLayout: {
    ...emptyActions(),
    create: createdPageLayoutUniversalIdentifiers.map(
      (universalIdentifier) => ({ flatEntity: { universalIdentifier } }),
    ),
    update: updatedPageLayoutUniversalIdentifiers.map(
      (universalIdentifier) => ({
        universalIdentifier,
      }),
    ),
  },
});

const run = ({
  navigationMenuItems,
  pageLayouts,
  report,
}: {
  navigationMenuItems: { universalIdentifier: string }[];
  pageLayouts: { universalIdentifier: string }[];
  report: any;
}) =>
  validateNavigationMenuItemPageLayoutReferenceCrossEntity({
    optimisticUniversalFlatMaps: {
      flatNavigationMenuItemMaps: mapsFrom(navigationMenuItems),
      flatPageLayoutMaps: mapsFrom(pageLayouts),
    },
    orchestratorActionsReport: report,
  });

const errorCodes = (result: ReturnType<typeof run>) =>
  result.navigationMenuItem.flatMap((failed) =>
    failed.errors.map((error) => error.code),
  );

describe('validateNavigationMenuItemPageLayoutReferenceCrossEntity', () => {
  it('accepts a created PAGE_LAYOUT item referencing a same-migration STANDALONE_PAGE layout', () => {
    const result = run({
      navigationMenuItems: [
        navigationMenuItem(PAGE_LAYOUT_UNIVERSAL_IDENTIFIER),
      ],
      pageLayouts: [pageLayout(PageLayoutType.STANDALONE_PAGE)],
      report: reportFrom({
        createdNavigationMenuItemUniversalIdentifiers: [
          NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        ],
        createdPageLayoutUniversalIdentifiers: [
          PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
        ],
      }),
    });

    expect(errorCodes(result)).not.toContain(
      NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
    );
  });

  it('rejects a created PAGE_LAYOUT item referencing a same-migration DASHBOARD layout', () => {
    const result = run({
      navigationMenuItems: [
        navigationMenuItem(PAGE_LAYOUT_UNIVERSAL_IDENTIFIER),
      ],
      pageLayouts: [pageLayout(PageLayoutType.DASHBOARD)],
      report: reportFrom({
        createdNavigationMenuItemUniversalIdentifiers: [
          NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        ],
        createdPageLayoutUniversalIdentifiers: [
          PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
        ],
      }),
    });

    expect(errorCodes(result)).toContain(
      NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
    );
  });

  it('rejects a created PAGE_LAYOUT item referencing a same-migration RECORD_PAGE layout', () => {
    const result = run({
      navigationMenuItems: [
        navigationMenuItem(PAGE_LAYOUT_UNIVERSAL_IDENTIFIER),
      ],
      pageLayouts: [pageLayout(PageLayoutType.RECORD_PAGE)],
      report: reportFrom({
        createdNavigationMenuItemUniversalIdentifiers: [
          NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        ],
        createdPageLayoutUniversalIdentifiers: [
          PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
        ],
      }),
    });

    expect(errorCodes(result)).toContain(
      NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
    );
  });

  it('does not raise a type error when the referenced layout cannot be resolved', () => {
    const result = run({
      navigationMenuItems: [
        navigationMenuItem(MISSING_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER),
      ],
      pageLayouts: [pageLayout(PageLayoutType.STANDALONE_PAGE)],
      report: reportFrom({
        createdNavigationMenuItemUniversalIdentifiers: [
          NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        ],
      }),
    });

    expect(errorCodes(result)).not.toContain(
      NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
    );
  });

  it('rejects an untouched item when its layout type is updated to a non-standalone type in the same migration', () => {
    const result = run({
      navigationMenuItems: [
        navigationMenuItem(PAGE_LAYOUT_UNIVERSAL_IDENTIFIER),
      ],
      pageLayouts: [pageLayout(PageLayoutType.RECORD_PAGE)],
      report: reportFrom({
        updatedPageLayoutUniversalIdentifiers: [
          PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
        ],
      }),
    });

    expect(errorCodes(result)).toContain(
      NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
    );
  });

  it('accepts an updated item whose layout is concurrently updated to STANDALONE_PAGE (no false positive)', () => {
    const result = run({
      navigationMenuItems: [
        navigationMenuItem(PAGE_LAYOUT_UNIVERSAL_IDENTIFIER),
      ],
      pageLayouts: [pageLayout(PageLayoutType.STANDALONE_PAGE)],
      report: reportFrom({
        updatedNavigationMenuItemUniversalIdentifiers: [
          NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        ],
        updatedPageLayoutUniversalIdentifiers: [
          PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
        ],
      }),
    });

    expect(errorCodes(result)).not.toContain(
      NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
    );
  });

  it('ignores items that are neither touched nor pointing to a touched layout', () => {
    const result = run({
      navigationMenuItems: [
        navigationMenuItem(PAGE_LAYOUT_UNIVERSAL_IDENTIFIER),
      ],
      pageLayouts: [pageLayout(PageLayoutType.DASHBOARD)],
      report: reportFrom({}),
    });

    expect(errorCodes(result)).toHaveLength(0);
  });
});
