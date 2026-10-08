import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CoreWorkflowAccessModule } from 'src/engine/core-modules/workflow/core-workflow-access.module';
import { CommandMenuItemResolver } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.resolver';
import { FrontComponentModule } from 'src/engine/metadata-modules/front-component/front-component.module';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { FlatCommandMenuItemModule } from 'src/engine/metadata-modules/flat-command-menu-item/flat-command-menu-item.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';

@Module({
  imports: [
    ApplicationTranslationCatalogModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    CoreWorkflowAccessModule,
    FlatCommandMenuItemModule,
    FrontComponentModule,
    PermissionsModule,
  ],
  providers: [CommandMenuItemService, CommandMenuItemResolver],
  exports: [CommandMenuItemService],
})
export class CommandMenuItemModule {}
