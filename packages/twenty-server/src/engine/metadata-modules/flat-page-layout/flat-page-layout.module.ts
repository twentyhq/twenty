import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceFlatPageLayoutMapCacheService } from 'src/engine/metadata-modules/flat-page-layout/services/workspace-flat-page-layout-map-cache.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageLayoutEntity,
      PageLayoutTabEntity,
      ApplicationEntity,
      ObjectMetadataEntity,
    ]),
  ],
  providers: [WorkspaceFlatPageLayoutMapCacheService],
  exports: [WorkspaceFlatPageLayoutMapCacheService],
})
export class FlatPageLayoutModule {}
