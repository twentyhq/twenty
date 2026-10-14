import { Module } from '@nestjs/common';

import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { PermissionFlagResolver } from 'src/engine/metadata-modules/permission-flag/permission-flag.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    PermissionsModule,
    ApplicationTranslationCatalogModule,
  ],
  providers: [PermissionFlagService, PermissionFlagResolver],
})
export class PermissionFlagModule {}
