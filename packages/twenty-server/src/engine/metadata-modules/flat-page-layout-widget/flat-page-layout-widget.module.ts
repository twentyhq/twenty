import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlatPageLayoutWidgetTypeValidatorService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { WorkspaceFlatPageLayoutWidgetMapCacheService } from 'src/engine/metadata-modules/flat-page-layout-widget/services/workspace-flat-page-layout-widget-map-cache.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageLayoutWidgetEntity,
      ApplicationEntity,
      PageLayoutTabEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
    ]),
  ],
  providers: [
    WorkspaceFlatPageLayoutWidgetMapCacheService,
    FlatPageLayoutWidgetTypeValidatorService,
  ],
  exports: [
    WorkspaceFlatPageLayoutWidgetMapCacheService,
    FlatPageLayoutWidgetTypeValidatorService,
  ],
})
export class FlatPageLayoutWidgetModule {}
