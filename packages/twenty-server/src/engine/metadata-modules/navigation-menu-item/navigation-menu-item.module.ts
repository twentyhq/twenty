import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatNavigationMenuItemModule } from 'src/engine/metadata-modules/flat-navigation-menu-item/flat-navigation-menu-item.module';
import { NavigationMenuItemGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/navigation-menu-item/interceptors/navigation-menu-item-graphql-api-exception.interceptor';
import { NavigationMenuItemDeletionJob } from 'src/engine/metadata-modules/navigation-menu-item/jobs/navigation-menu-item-deletion.job';
import { NavigationMenuItemDeletionListener } from 'src/engine/metadata-modules/navigation-menu-item/listeners/navigation-menu-item-deletion.listener';
import { NavigationMenuItemResolver } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.resolver';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { NavigationMenuItemAccessService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-access.service';
import { NavigationMenuItemDeletionService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-deletion.service';
import { NavigationMenuItemRecordIdentifierService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-record-identifier.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    FlatNavigationMenuItemModule,
    PermissionsModule,
    FileModule,
  ],
  providers: [
    NavigationMenuItemService,
    NavigationMenuItemAccessService,
    NavigationMenuItemDeletionService,
    NavigationMenuItemDeletionListener,
    NavigationMenuItemDeletionJob,
    NavigationMenuItemResolver,
    NavigationMenuItemRecordIdentifierService,
    NavigationMenuItemGraphqlApiExceptionInterceptor,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [
    NavigationMenuItemService,
    NavigationMenuItemRecordIdentifierService,
  ],
})
export class NavigationMenuItemModule {}
