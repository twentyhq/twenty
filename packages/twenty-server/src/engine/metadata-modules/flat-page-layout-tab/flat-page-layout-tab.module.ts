import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceFlatPageLayoutTabMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-tab/services/workspace-flat-page-layout-tab-map-cache.service';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageLayoutTabEntity,
      PageLayoutWidgetEntity,
      ApplicationEntity,
      PageLayoutEntity,
    ]),
  ],
  providers: [
    WorkspaceFlatPageLayoutTabMapCacheService,
    provideWorkspaceScopedRepository(PageLayoutEntity),
    provideWorkspaceScopedRepository(PageLayoutTabEntity),
    provideWorkspaceScopedRepository(PageLayoutWidgetEntity),
  ],
  exports: [WorkspaceFlatPageLayoutTabMapCacheService],
})
export class FlatPageLayoutTabModule {}
