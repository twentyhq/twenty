import { getObjectNavigationMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { validateWorkspaceLevelObjectNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-workspace-level-object-navigation-menu-item.util';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const RESERVED_UNIVERSAL_IDENTIFIER =
  getObjectNavigationMenuItemUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

const buildFlatNavigationMenuItem = (
  overrides: Partial<UniversalFlatNavigationMenuItem> = {},
): UniversalFlatNavigationMenuItem =>
  ({
    universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000001',
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    type: NavigationMenuItemType.OBJECT,
    userWorkspaceId: null,
    targetObjectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    isSystemSideEffect: false,
    position: 0,
    ...overrides,
  }) as UniversalFlatNavigationMenuItem;

const validate = ({
  flatNavigationMenuItem,
  existingFlatNavigationMenuItems = [],
}: {
  flatNavigationMenuItem: UniversalFlatNavigationMenuItem;
  existingFlatNavigationMenuItems?: Partial<UniversalFlatNavigationMenuItem>[];
}) =>
  validateWorkspaceLevelObjectNavigationMenuItem({
    flatNavigationMenuItem,
    optimisticFlatNavigationMenuItemMaps: {
      byUniversalIdentifier: Object.fromEntries(
        existingFlatNavigationMenuItems.map(
          (existingFlatNavigationMenuItem) => [
            existingFlatNavigationMenuItem.universalIdentifier,
            existingFlatNavigationMenuItem,
          ],
        ),
      ),
    } as never,
    optimisticFlatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [OBJECT_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      },
    } as never,
  });

describe('validateWorkspaceLevelObjectNavigationMenuItem', () => {
  it('should accept an engine-emitted item on the derived identifier', () => {
    expect(
      validate({
        flatNavigationMenuItem: buildFlatNavigationMenuItem({
          universalIdentifier: RESERVED_UNIVERSAL_IDENTIFIER,
          isSystemSideEffect: true,
        }),
      }),
    ).toEqual([]);
  });

  it('should reject a caller row squatting on the derived identifier', () => {
    const errors = validate({
      flatNavigationMenuItem: buildFlatNavigationMenuItem({
        universalIdentifier: RESERVED_UNIVERSAL_IDENTIFIER,
      }),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('reserved');
  });

  it('should reject a second workspace-level item for the same object', () => {
    const errors = validate({
      flatNavigationMenuItem: buildFlatNavigationMenuItem(),
      existingFlatNavigationMenuItems: [
        buildFlatNavigationMenuItem({
          universalIdentifier: RESERVED_UNIVERSAL_IDENTIFIER,
          isSystemSideEffect: true,
        }),
      ],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('already has');
  });

  it('should ignore a user-scoped item targeting an object that already has one', () => {
    expect(
      validate({
        flatNavigationMenuItem: buildFlatNavigationMenuItem({
          userWorkspaceId: 'd1d2d3d4-d5d6-4000-8000-000000000001',
        }),
        existingFlatNavigationMenuItems: [
          buildFlatNavigationMenuItem({
            universalIdentifier: RESERVED_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: true,
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('should ignore variants other than OBJECT', () => {
    expect(
      validate({
        flatNavigationMenuItem: buildFlatNavigationMenuItem({
          type: NavigationMenuItemType.VIEW,
          targetObjectMetadataUniversalIdentifier: null,
        }),
      }),
    ).toEqual([]);
  });
});
