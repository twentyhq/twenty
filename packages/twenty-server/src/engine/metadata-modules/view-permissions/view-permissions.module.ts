import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { I18nModule } from 'src/engine/core-modules/i18n/i18n.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

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
    I18nModule,
    PermissionsModule,
    WorkspaceCacheStorageModule,
  ],
  providers: [ViewService, ViewEntityLookupService],
  exports: [ViewService, ViewEntityLookupService],
})
export class ViewPermissionsModule {}
