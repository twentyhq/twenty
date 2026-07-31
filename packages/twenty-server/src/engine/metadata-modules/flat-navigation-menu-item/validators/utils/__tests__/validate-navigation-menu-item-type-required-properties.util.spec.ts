import { NavigationMenuItemType } from 'twenty-shared/types';

import { validateNavigationMenuItemTypeRequiredProperties } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-type-required-properties.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';

const buildFlatNavigationMenuItem = (
  overrides: Partial<UniversalFlatNavigationMenuItem>,
): UniversalFlatNavigationMenuItem =>
  ({
    universalIdentifier: '20202020-0000-0000-0000-000000000001',
    name: null,
    link: null,
    icon: null,
    color: null,
    position: 0,
    targetRecordId: null,
    userWorkspaceId: null,
    folderUniversalIdentifier: null,
    viewUniversalIdentifier: null,
    pageLayoutUniversalIdentifier: null,
    targetObjectMetadataUniversalIdentifier: null,
    ...overrides,
  }) as UniversalFlatNavigationMenuItem;

describe('validateNavigationMenuItemTypeRequiredProperties', () => {
  it('should return an error when type is not defined', () => {
    const errors = validateNavigationMenuItemTypeRequiredProperties({
      flatNavigationMenuItem: buildFlatNavigationMenuItem({
        type: undefined,
      }),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      message: 'Navigation menu item type is required',
    });
  });

  it.each([
    {
      type: NavigationMenuItemType.FOLDER,
      missingProperties: ['name'],
    },
    {
      type: NavigationMenuItemType.OBJECT,
      missingProperties: ['targetObjectMetadataUniversalIdentifier'],
    },
    {
      type: NavigationMenuItemType.VIEW,
      missingProperties: ['viewUniversalIdentifier'],
    },
    {
      type: NavigationMenuItemType.RECORD,
      missingProperties: [
        'targetRecordId',
        'targetObjectMetadataUniversalIdentifier',
      ],
    },
    {
      type: NavigationMenuItemType.LINK,
      missingProperties: ['link'],
    },
    {
      type: NavigationMenuItemType.PAGE_LAYOUT,
      missingProperties: ['pageLayoutUniversalIdentifier'],
    },
  ])(
    'should report every missing universal property for $type type',
    ({ type, missingProperties }) => {
      const errors = validateNavigationMenuItemTypeRequiredProperties({
        flatNavigationMenuItem: buildFlatNavigationMenuItem({ type }),
      });

      expect(errors.map(({ message }) => message)).toEqual(
        missingProperties.map(
          (property) => `${property} is required for ${type} type`,
        ),
      );
    },
  );

  it('should not report any error when required universal properties are defined', () => {
    const errors = validateNavigationMenuItemTypeRequiredProperties({
      flatNavigationMenuItem: buildFlatNavigationMenuItem({
        type: NavigationMenuItemType.PAGE_LAYOUT,
        pageLayoutUniversalIdentifier: '20202020-0000-0000-0000-0000000000aa',
      }),
    });

    expect(errors).toEqual([]);
  });

  it('should treat blank strings as missing', () => {
    const errors = validateNavigationMenuItemTypeRequiredProperties({
      flatNavigationMenuItem: buildFlatNavigationMenuItem({
        type: NavigationMenuItemType.LINK,
        link: '   ',
      }),
    });

    expect(errors.map(({ message }) => message)).toEqual([
      'link is required for LINK type',
    ]);
  });
});
