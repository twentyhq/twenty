import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CreateCompanyAndPersonService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/services/create-company.service';
import { CreatePersonService } from 'src/modules/contact-creation-manager/services/create-person.service';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([FeatureFlagEntity]),
    TypeOrmModule.forFeature([ObjectMetadataEntity, FieldMetadataEntity]),
  ],
  providers: [
    CreateCompanyService,
    CreatePersonService,
    CreateCompanyAndPersonService,
  ],
  exports: [CreateCompanyAndPersonService],
})
export class ContactCreationManagerModule {}
