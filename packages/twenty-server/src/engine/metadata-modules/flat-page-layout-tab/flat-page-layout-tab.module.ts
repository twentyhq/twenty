import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatPageLayoutTabMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-tab/services/workspace-flat-page-layout-tab-map-cache.service';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PageLayoutTabEntity, PageLayoutWidgetEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceFlatPageLayoutTabMapCacheService],
  exports: [WorkspaceFlatPageLayoutTabMapCacheService],
})
export class FlatPageLayoutTabModule {}
