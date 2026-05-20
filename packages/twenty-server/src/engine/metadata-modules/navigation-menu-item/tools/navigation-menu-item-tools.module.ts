import { Global, Module } from '@nestjs/common';

import { NAVIGATION_MENU_ITEM_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/navigation-menu-item-tool-service.token';
import { NavigationMenuItemModule } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.module';

import { NavigationMenuItemToolWorkspaceService } from './services/navigation-menu-item-tool.workspace-service';

// Global module to make NAVIGATION_MENU_ITEM_TOOL_SERVICE_TOKEN available to
// ToolProviderModule without creating a circular dependency.
@Global()
@Module({
  imports: [NavigationMenuItemModule],
  providers: [
    NavigationMenuItemToolWorkspaceService,
    {
      provide: NAVIGATION_MENU_ITEM_TOOL_SERVICE_TOKEN,
      useExisting: NavigationMenuItemToolWorkspaceService,
    },
  ],
  exports: [
    NavigationMenuItemToolWorkspaceService,
    NAVIGATION_MENU_ITEM_TOOL_SERVICE_TOKEN,
  ],
})
export class NavigationMenuItemToolsModule {}
