import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { NavigationMenuItemModule } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.module';
import { CreateNavigationMenuItemTool } from 'src/engine/metadata-modules/navigation-menu-item/tools/create-navigation-menu-item.tool';
import { DeleteNavigationMenuItemTool } from 'src/engine/metadata-modules/navigation-menu-item/tools/delete-navigation-menu-item.tool';
import { ListNavigationMenuItemsTool } from 'src/engine/metadata-modules/navigation-menu-item/tools/list-navigation-menu-items.tool';
import { UpdateNavigationMenuItemTool } from 'src/engine/metadata-modules/navigation-menu-item/tools/update-navigation-menu-item.tool';

@Module({
  imports: [NavigationMenuItemModule, FeatureFlagModule],
  providers: [
    ListNavigationMenuItemsTool,
    CreateNavigationMenuItemTool,
    UpdateNavigationMenuItemTool,
    DeleteNavigationMenuItemTool,
  ],
})
export class NavigationMenuItemToolsModule {}
