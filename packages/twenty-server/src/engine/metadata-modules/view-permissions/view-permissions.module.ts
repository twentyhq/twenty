import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { I18nModule } from 'src/engine/core-modules/i18n/i18n.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { CreateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-field-permission.guard';
import { CreateViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-filter-group-permission.guard';
import { CreateViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-filter-permission.guard';
import { CreateViewGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-group-permission.guard';
import { CreateViewPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-permission.guard';
import { CreateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-sort-permission.guard';
import { DeleteViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-field-permission.guard';
import { DeleteViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-filter-group-permission.guard';
import { DeleteViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-filter-permission.guard';
import { DeleteViewGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-group-permission.guard';
import { DeleteViewPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-permission.guard';
import { DeleteViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/delete-view-sort-permission.guard';
import { DestroyViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-field-permission.guard';
import { DestroyViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-filter-group-permission.guard';
import { DestroyViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-filter-permission.guard';
import { DestroyViewGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-group-permission.guard';
import { DestroyViewPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-permission.guard';
import { DestroyViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/destroy-view-sort-permission.guard';
import { UpdateViewFieldPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-field-permission.guard';
import { UpdateViewFilterGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-filter-group-permission.guard';
import { UpdateViewFilterPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-filter-permission.guard';
import { UpdateViewGroupPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-group-permission.guard';
import { UpdateViewPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-permission.guard';
import { UpdateViewSortPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/update-view-sort-permission.guard';
import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ViewEntity,
      ViewFieldEntity,
      ViewFilterEntity,
      ViewFilterGroupEntity,
      ViewGroupEntity,
      ViewSortEntity,
    ]),
    ApplicationModule,
    I18nModule,
    PermissionsModule,
    WorkspaceCacheStorageModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationV2Module,
  ],
  providers: [
    ViewService,
    ViewEntityLookupService,
    ViewAccessService,
    CreateViewPermissionGuard,
    UpdateViewPermissionGuard,
    DeleteViewPermissionGuard,
    DestroyViewPermissionGuard,
    CreateViewFieldPermissionGuard,
    UpdateViewFieldPermissionGuard,
    DeleteViewFieldPermissionGuard,
    DestroyViewFieldPermissionGuard,
    CreateViewFilterPermissionGuard,
    UpdateViewFilterPermissionGuard,
    DeleteViewFilterPermissionGuard,
    DestroyViewFilterPermissionGuard,
    CreateViewFilterGroupPermissionGuard,
    UpdateViewFilterGroupPermissionGuard,
    DeleteViewFilterGroupPermissionGuard,
    DestroyViewFilterGroupPermissionGuard,
    CreateViewGroupPermissionGuard,
    UpdateViewGroupPermissionGuard,
    DeleteViewGroupPermissionGuard,
    DestroyViewGroupPermissionGuard,
    CreateViewSortPermissionGuard,
    UpdateViewSortPermissionGuard,
    DeleteViewSortPermissionGuard,
    DestroyViewSortPermissionGuard,
  ],
  exports: [
    ViewService,
    ViewEntityLookupService,
    ViewAccessService,
    CreateViewPermissionGuard,
    UpdateViewPermissionGuard,
    DeleteViewPermissionGuard,
    DestroyViewPermissionGuard,
    CreateViewFieldPermissionGuard,
    UpdateViewFieldPermissionGuard,
    DeleteViewFieldPermissionGuard,
    DestroyViewFieldPermissionGuard,
    CreateViewFilterPermissionGuard,
    UpdateViewFilterPermissionGuard,
    DeleteViewFilterPermissionGuard,
    DestroyViewFilterPermissionGuard,
    CreateViewFilterGroupPermissionGuard,
    UpdateViewFilterGroupPermissionGuard,
    DeleteViewFilterGroupPermissionGuard,
    DestroyViewFilterGroupPermissionGuard,
    CreateViewGroupPermissionGuard,
    UpdateViewGroupPermissionGuard,
    DeleteViewGroupPermissionGuard,
    DestroyViewGroupPermissionGuard,
    CreateViewSortPermissionGuard,
    UpdateViewSortPermissionGuard,
    DeleteViewSortPermissionGuard,
    DestroyViewSortPermissionGuard,
  ],
})
export class ViewPermissionsModule {}
