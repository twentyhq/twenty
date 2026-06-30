import { NavigationMenuItemType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';
import { FlatNavigationMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-navigation-menu-item-validator.service';

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

const pageLayout = (type: PageLayoutType): { universalIdentifier: string } =>
  ({
    universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
    type,
  }) as unknown as { universalIdentifier: string };

const navigationMenuItem = (
  pageLayoutUniversalIdentifier: string | null,
): UniversalFlatNavigationMenuItem =>
  ({
    universalIdentifier: NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
    type: NavigationMenuItemType.PAGE_LAYOUT,
    name: 'Some page',
    position: 0,
    pageLayoutUniversalIdentifier,
    viewUniversalIdentifier: null,
    targetObjectMetadataUniversalIdentifier: null,
    targetRecordId: null,
    link: null,
    folderUniversalIdentifier: null,
  }) as unknown as UniversalFlatNavigationMenuItem;

const buildCreationArgs = ({
  flatNavigationMenuItem,
  pageLayouts,
}: {
  flatNavigationMenuItem: UniversalFlatNavigationMenuItem;
  pageLayouts: { universalIdentifier: string }[];
}) =>
  ({
    flatEntityToValidate: flatNavigationMenuItem,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatNavigationMenuItemMaps: mapsFrom([]),
      flatPageLayoutMaps: mapsFrom(pageLayouts),
    },
    remainingFlatEntityMapsToValidate: mapsFrom([]),
    additionalCacheDataMaps: { featureFlagsMap: {} },
    workspaceId: 'workspace-id',
    buildOptions: {} as never,
  }) as unknown as Parameters<
    FlatNavigationMenuItemValidatorService['validateFlatNavigationMenuItemCreation']
  >[0];

describe('FlatNavigationMenuItemValidatorService', () => {
  let service: FlatNavigationMenuItemValidatorService;

  beforeEach(() => {
    service = new FlatNavigationMenuItemValidatorService();
  });

  describe('validateFlatNavigationMenuItemCreation - PAGE_LAYOUT type', () => {
    it('accepts a PAGE_LAYOUT item referencing a STANDALONE_PAGE layout', () => {
      const result = service.validateFlatNavigationMenuItemCreation(
        buildCreationArgs({
          flatNavigationMenuItem: navigationMenuItem(
            PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          ),
          pageLayouts: [pageLayout(PageLayoutType.STANDALONE_PAGE)],
        }),
      );

      expect(result.errors.map((error) => error.code)).not.toContain(
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    });

    it('rejects a PAGE_LAYOUT item referencing a DASHBOARD layout', () => {
      const result = service.validateFlatNavigationMenuItemCreation(
        buildCreationArgs({
          flatNavigationMenuItem: navigationMenuItem(
            PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          ),
          pageLayouts: [pageLayout(PageLayoutType.DASHBOARD)],
        }),
      );

      expect(result.errors.map((error) => error.code)).toContain(
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    });

    it('rejects a PAGE_LAYOUT item referencing a RECORD_PAGE layout', () => {
      const result = service.validateFlatNavigationMenuItemCreation(
        buildCreationArgs({
          flatNavigationMenuItem: navigationMenuItem(
            PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          ),
          pageLayouts: [pageLayout(PageLayoutType.RECORD_PAGE)],
        }),
      );

      expect(result.errors.map((error) => error.code)).toContain(
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    });

    it('does not raise a type error when the referenced layout cannot be resolved (existence is enforced during foreign key resolution)', () => {
      const result = service.validateFlatNavigationMenuItemCreation(
        buildCreationArgs({
          flatNavigationMenuItem: navigationMenuItem(
            MISSING_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          ),
          pageLayouts: [pageLayout(PageLayoutType.STANDALONE_PAGE)],
        }),
      );

      expect(result.errors.map((error) => error.code)).not.toContain(
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    });
  });
});
