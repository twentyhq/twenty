import type { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';

export type NavigationMenuItemToolDependencies = {
  navigationMenuItemService: NavigationMenuItemService;
};

export type NavigationMenuItemToolContext = {
  workspaceId: string;
  userWorkspaceId?: string;
};
