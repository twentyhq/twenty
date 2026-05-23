import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { createCreateNavigationMenuItemTool } from 'src/engine/metadata-modules/navigation-menu-item/tools/create-navigation-menu-item.tool';
import { createDeleteNavigationMenuItemTool } from 'src/engine/metadata-modules/navigation-menu-item/tools/delete-navigation-menu-item.tool';
import { createListNavigationMenuItemsTool } from 'src/engine/metadata-modules/navigation-menu-item/tools/list-navigation-menu-items.tool';
import { type NavigationMenuItemToolDependencies } from 'src/engine/metadata-modules/navigation-menu-item/tools/types/navigation-menu-item-tool-dependencies.type';
import { createUpdateNavigationMenuItemTool } from 'src/engine/metadata-modules/navigation-menu-item/tools/update-navigation-menu-item.tool';

@Injectable()
export class NavigationMenuItemToolWorkspaceService {
  private readonly deps: NavigationMenuItemToolDependencies;

  constructor(navigationMenuItemService: NavigationMenuItemService) {
    this.deps = { navigationMenuItemService };
  }

  generateNavigationMenuItemTools(
    workspaceId: string,
    userWorkspaceId?: string,
  ): ToolSet {
    const context = { workspaceId, userWorkspaceId };

    const listNavigationMenuItems = createListNavigationMenuItemsTool(
      this.deps,
      context,
    );
    const createNavigationMenuItem = createCreateNavigationMenuItemTool(
      this.deps,
      context,
    );
    const updateNavigationMenuItem = createUpdateNavigationMenuItemTool(
      this.deps,
      context,
    );
    const deleteNavigationMenuItem = createDeleteNavigationMenuItemTool(
      this.deps,
      context,
    );

    return {
      [listNavigationMenuItems.name]: listNavigationMenuItems,
      [createNavigationMenuItem.name]: createNavigationMenuItem,
      [updateNavigationMenuItem.name]: updateNavigationMenuItem,
      [deleteNavigationMenuItem.name]: deleteNavigationMenuItem,
    };
  }
}
