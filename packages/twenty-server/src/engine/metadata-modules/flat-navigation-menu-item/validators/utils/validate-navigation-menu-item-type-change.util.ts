import { type NavigationMenuItemType } from 'twenty-shared/types';

import { type NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { validateNavigationMenuItemParentType } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-parent-type.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateNavigationMenuItemTypeChange = ({
  type,
  parentType,
  childTypes,
}: {
  type: NavigationMenuItemType;
  parentType: NavigationMenuItemType | undefined;
  childTypes: NavigationMenuItemType[];
}): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] => [
  ...validateNavigationMenuItemParentType({ type, parentType }),
  ...childTypes.flatMap((childType) =>
    validateNavigationMenuItemParentType({
      type: childType,
      parentType: type,
    }),
  ),
];
