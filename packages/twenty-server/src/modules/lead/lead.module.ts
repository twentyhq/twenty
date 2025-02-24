import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

import { ConversionTemplateEntity } from './conversion-templates/conversion-template.entity';
import { ConversionTemplateResolver } from './conversion-templates/conversion-template.resolver';
import { ConversionTemplateService } from './conversion-templates/conversion-template.service';
import { LeadConversionResolver } from './resolvers/lead-conversion.resolver';
import { LeadConversionService } from './services/lead-conversion.service';
import { LeadWorkspaceEntity } from './standard-objects/lead.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LeadWorkspaceEntity, ConversionTemplateEntity],
      'metadata',
    ),
    ObjectMetadataModule,
    FieldMetadataModule,
    WorkspaceDataSourceModule,
  ],
  providers: [
    LeadConversionService,
    LeadConversionResolver,
    ConversionTemplateService,
    ConversionTemplateResolver,
  ],
  exports: [LeadConversionService, ConversionTemplateService],
})
export class LeadModule {}
