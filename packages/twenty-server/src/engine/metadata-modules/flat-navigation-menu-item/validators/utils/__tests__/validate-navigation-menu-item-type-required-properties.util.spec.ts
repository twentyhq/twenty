import { NavigationMenuItemType } from 'twenty-shared/types';

import { validateNavigationMenuItemTypeRequiredProperties } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-type-required-properties.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';

const VALID_UUID = '20202020-b001-4b01-8b01-c0aba11c0001';
const OTHER_VALID_UUID = '20202020-b002-4b02-8b02-c0aba11c0002';

const buildFlatNavigationMenuItem = (
  overrides: Partial<UniversalFlatNavigationMenuItem>,
): UniversalFlatNavigationMenuItem =>
  ({
    universalIdentifier: VALID_UUID,
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
      expectedMessages: ['A name is required for FOLDER type'],
    },
    {
      type: NavigationMenuItemType.OBJECT,
      expectedMessages: [
        'A valid targetObjectMetadataUniversalIdentifier is required for OBJECT type',
      ],
    },
    {
      type: NavigationMenuItemType.VIEW,
      expectedMessages: [
        'A valid viewUniversalIdentifier is required for VIEW type',
      ],
    },
    {
      type: NavigationMenuItemType.RECORD,
      expectedMessages: [
        'A valid targetRecordId is required for RECORD type',
        'A valid targetObjectMetadataUniversalIdentifier is required for RECORD type',
      ],
    },
    {
      type: NavigationMenuItemType.LINK,
      expectedMessages: ['A valid link is required for LINK type'],
    },
    {
      type: NavigationMenuItemType.PAGE_LAYOUT,
      expectedMessages: [
        'A valid pageLayoutUniversalIdentifier is required for PAGE_LAYOUT type',
      ],
    },
  ])(
    'should report every missing property for $type type',
    ({ type, expectedMessages }) => {
      const errors = validateNavigationMenuItemTypeRequiredProperties({
        flatNavigationMenuItem: buildFlatNavigationMenuItem({ type }),
      });

      expect(errors.map(({ message }) => message)).toEqual(expectedMessages);
    },
  );

  it.each([
    {
      type: NavigationMenuItemType.FOLDER,
      overrides: { name: 'My folder' },
    },
    {
      type: NavigationMenuItemType.OBJECT,
      overrides: { targetObjectMetadataUniversalIdentifier: VALID_UUID },
    },
    {
      type: NavigationMenuItemType.VIEW,
      overrides: { viewUniversalIdentifier: VALID_UUID },
    },
    {
      type: NavigationMenuItemType.RECORD,
      overrides: {
        targetRecordId: VALID_UUID,
        targetObjectMetadataUniversalIdentifier: OTHER_VALID_UUID,
      },
    },
    {
      type: NavigationMenuItemType.LINK,
      overrides: { link: 'https://twenty.com' },
    },
    {
      type: NavigationMenuItemType.PAGE_LAYOUT,
      overrides: { pageLayoutUniversalIdentifier: VALID_UUID },
    },
  ])(
    'should not report any error when $type type properties are valid',
    ({ type, overrides }) => {
      const errors = validateNavigationMenuItemTypeRequiredProperties({
        flatNavigationMenuItem: buildFlatNavigationMenuItem({
          type,
          ...overrides,
        }),
      });

      expect(errors).toEqual([]);
    },
  );

  it('should return an error when type is unknown', () => {
    const errors = validateNavigationMenuItemTypeRequiredProperties({
      flatNavigationMenuItem: buildFlatNavigationMenuItem({
        type: 'UNKNOWN_NAVIGATION_MENU_ITEM_TYPE' as NavigationMenuItemType,
      }),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      message:
        'Unknown navigation menu item type UNKNOWN_NAVIGATION_MENU_ITEM_TYPE',
    });
  });

  it('should treat blank folder names as missing', () => {
    const errors = validateNavigationMenuItemTypeRequiredProperties({
      flatNavigationMenuItem: buildFlatNavigationMenuItem({
        type: NavigationMenuItemType.FOLDER,
        name: '   ',
      }),
    });

    expect(errors.map(({ message }) => message)).toEqual([
      'A name is required for FOLDER type',
    ]);
  });

  it('should report an error when the link is not a valid url', () => {
    const errors = validateNavigationMenuItemTypeRequiredProperties({
      flatNavigationMenuItem: buildFlatNavigationMenuItem({
        type: NavigationMenuItemType.LINK,
        link: 'not a link',
      }),
    });

    expect(errors.map(({ message }) => message)).toEqual([
      'A valid link is required for LINK type',
    ]);
  });

  it('should report an error when a universal identifier is not a valid uuid', () => {
    const errors = validateNavigationMenuItemTypeRequiredProperties({
      flatNavigationMenuItem: buildFlatNavigationMenuItem({
        type: NavigationMenuItemType.VIEW,
        viewUniversalIdentifier: 'not-a-uuid',
      }),
    });

    expect(errors.map(({ message }) => message)).toEqual([
      'A valid viewUniversalIdentifier is required for VIEW type',
    ]);
  });
});
