import { NavigationMenuItemType } from 'twenty-shared/types';

import {
  validateNavigationMenuItemParentType,
  validateNavigationMenuItemTypeChange,
} from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-hierarchy.util';

const isAllowed = ({
  type,
  parentType,
}: {
  type: NavigationMenuItemType;
  parentType: NavigationMenuItemType;
}) => validateNavigationMenuItemParentType({ type, parentType }).length === 0;

describe('validateNavigationMenuItemParentType', () => {
  it('should allow any item at the root', () => {
    expect(
      validateNavigationMenuItemParentType({
        type: NavigationMenuItemType.TAB,
        parentType: undefined,
      }),
    ).toEqual([]);
  });

  it('should refuse any parent for a tab', () => {
    expect(
      isAllowed({
        type: NavigationMenuItemType.TAB,
        parentType: NavigationMenuItemType.TAB,
      }),
    ).toBe(false);
    expect(
      isAllowed({
        type: NavigationMenuItemType.TAB,
        parentType: NavigationMenuItemType.SECTION,
      }),
    ).toBe(false);
  });

  it('should only allow a section inside a tab', () => {
    expect(
      isAllowed({
        type: NavigationMenuItemType.SECTION,
        parentType: NavigationMenuItemType.TAB,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.SECTION,
        parentType: NavigationMenuItemType.SECTION,
      }),
    ).toBe(false);
    expect(
      isAllowed({
        type: NavigationMenuItemType.SECTION,
        parentType: NavigationMenuItemType.FOLDER,
      }),
    ).toBe(false);
  });

  it('should allow a folder inside a tab or a section but not a folder', () => {
    expect(
      isAllowed({
        type: NavigationMenuItemType.FOLDER,
        parentType: NavigationMenuItemType.TAB,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.FOLDER,
        parentType: NavigationMenuItemType.SECTION,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.FOLDER,
        parentType: NavigationMenuItemType.FOLDER,
      }),
    ).toBe(false);
  });

  it('should allow other items inside a tab, a section or a folder only', () => {
    expect(
      isAllowed({
        type: NavigationMenuItemType.LINK,
        parentType: NavigationMenuItemType.TAB,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.LINK,
        parentType: NavigationMenuItemType.SECTION,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.LINK,
        parentType: NavigationMenuItemType.FOLDER,
      }),
    ).toBe(true);
    expect(
      isAllowed({
        type: NavigationMenuItemType.LINK,
        parentType: NavigationMenuItemType.OBJECT,
      }),
    ).toBe(false);
  });
});

describe('validateNavigationMenuItemTypeChange', () => {
  it('should accept a new type that fits its parent and children', () => {
    expect(
      validateNavigationMenuItemTypeChange({
        type: NavigationMenuItemType.SECTION,
        parentType: NavigationMenuItemType.TAB,
        childTypes: [
          NavigationMenuItemType.FOLDER,
          NavigationMenuItemType.LINK,
        ],
      }),
    ).toEqual([]);
  });

  it('should refuse a new type its parent cannot hold', () => {
    expect(
      validateNavigationMenuItemTypeChange({
        type: NavigationMenuItemType.TAB,
        parentType: NavigationMenuItemType.TAB,
        childTypes: [],
      }),
    ).toHaveLength(1);
  });

  it('should refuse a new type that cannot hold its children', () => {
    expect(
      validateNavigationMenuItemTypeChange({
        type: NavigationMenuItemType.SECTION,
        parentType: undefined,
        childTypes: [NavigationMenuItemType.SECTION],
      }),
    ).toHaveLength(1);
  });
});
