import { msg, t } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_ITEM_CONTAINER_TYPES } from 'src/engine/metadata-modules/flat-navigation-menu-item/constants/navigation-menu-item-container-types.constant';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const ALLOWED_PARENT_TYPES_BY_TYPE: Partial<
  Record<NavigationMenuItemType, NavigationMenuItemType[]>
> = {
  [NavigationMenuItemType.TAB]: [],
  [NavigationMenuItemType.SECTION]: [NavigationMenuItemType.TAB],
  [NavigationMenuItemType.FOLDER]: [
    NavigationMenuItemType.TAB,
    NavigationMenuItemType.SECTION,
  ],
};

const getParentTypeErrors = ({
  type,
  parentType,
  isParentBuiltInSection,
}: {
  type: NavigationMenuItemType | undefined;
  parentType: NavigationMenuItemType | undefined;
  isParentBuiltInSection: boolean;
}): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] => {
  if (!isDefined(type) || !isDefined(parentType)) {
    return [];
  }

  if (isParentBuiltInSection) {
    return [
      {
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`A ${type} navigation menu item cannot be placed inside a built-in section`,
        userFriendlyMessage: msg`A ${type} navigation menu item cannot be placed inside a built-in section`,
      },
    ];
  }

  const allowedParentTypes =
    ALLOWED_PARENT_TYPES_BY_TYPE[type] ?? NAVIGATION_MENU_ITEM_CONTAINER_TYPES;

  if (allowedParentTypes.includes(parentType)) {
    return [];
  }

  return [
    {
      code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      message: t`A ${type} navigation menu item cannot be placed inside a ${parentType}`,
      userFriendlyMessage: msg`A ${type} navigation menu item cannot be placed inside a ${parentType}`,
    },
  ];
};

export const validateNavigationMenuItemHierarchy = ({
  type,
  builtInSectionKey,
  parentType,
  parentBuiltInSectionKey,
  childTypes = [],
}: {
  type: NavigationMenuItemType | undefined;
  builtInSectionKey?: string | null;
  parentType: NavigationMenuItemType | undefined;
  parentBuiltInSectionKey?: string | null;
  childTypes?: NavigationMenuItemType[];
}): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] => [
  ...getParentTypeErrors({
    type,
    parentType,
    isParentBuiltInSection: isDefined(parentBuiltInSectionKey),
  }),
  ...childTypes.flatMap((childType) =>
    getParentTypeErrors({
      type: childType,
      parentType: type,
      isParentBuiltInSection: isDefined(builtInSectionKey),
    }),
  ),
];
