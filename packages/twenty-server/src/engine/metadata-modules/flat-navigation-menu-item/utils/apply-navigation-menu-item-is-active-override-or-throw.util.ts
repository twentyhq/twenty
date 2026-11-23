import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { dispatchIsActiveUpdateToAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/dispatch-is-active-update-to-authored-override.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';

export const applyNavigationMenuItemIsActiveOverrideOrThrow = ({
  flatNavigationMenuItem,
  isActive,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatNavigationMenuItem: FlatNavigationMenuItem;
  isActive: boolean;
  workspaceCustomApplicationUniversalIdentifier: string;
}): FlatNavigationMenuItem => {
  const isOwnedByAnotherApplication = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier:
      workspaceCustomApplicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      flatNavigationMenuItem.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    isSystemSideEffect: false,
  });

  if (!isOwnedByAnotherApplication) {
    throw new NavigationMenuItemException(
      'Only navigation menu items owned by another application can be hidden or restored',
      NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
    );
  }

  return dispatchIsActiveUpdateToAuthoredOverride({
    metadataName: 'navigationMenuItem',
    flatEntity: flatNavigationMenuItem,
    isActive,
    authorUniversalIdentifier: workspaceCustomApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  });
};
