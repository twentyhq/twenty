import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { CreateViewChildEntityPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-child-entity-permission.guard';
import { ViewPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/view-permission.guard';
import { CreateViewPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-permission.guard';

@Module({
  imports: [
    FeatureFlagModule,
    TypeOrmModule.forFeature([ViewEntity]),
    ApplicationModule,
    PermissionsModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    ViewService,
    ViewEntityLookupService,
    ViewAccessService,
    CreateViewPermissionGuard,
    CreateViewChildEntityPermissionGuard,
    ViewPermissionGuard,
    provideWorkspaceScopedRepository(ViewEntity),
  ],
  exports: [
    ViewService,
    ViewEntityLookupService,
    ViewAccessService,
    CreateViewPermissionGuard,
    CreateViewChildEntityPermissionGuard,
    ViewPermissionGuard,
  ],
})
export class ViewPermissionsModule {}
