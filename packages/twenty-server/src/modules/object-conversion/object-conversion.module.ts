import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

import { ObjectConversionSettingsEntity } from './entities/object-conversion-settings.entity';
import { ObjectConversionTemplateEntity } from './entities/object-conversion-template.entity';
import { ObjectConversionService } from './services/object-conversion.service';
import { ObjectConversionResolver } from './resolvers/object-conversion.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ObjectConversionSettingsEntity, ObjectConversionTemplateEntity],
      'metadata',
    ),
    ObjectMetadataModule,
    FieldMetadataModule,
    WorkspaceDataSourceModule,
  ],
  providers: [ObjectConversionService, ObjectConversionResolver],
  exports: [ObjectConversionService],
})
export class ObjectConversionModule {}
