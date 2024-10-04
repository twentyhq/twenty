import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { AutoCompaniesAndContactsCreationCalendarChannelListener } from 'src/modules/contact-creation-manager/listeners/auto-companies-and-contacts-creation-calendar-channel.listener';
import { AutoCompaniesAndContactsCreationMessageChannelListener } from 'src/modules/contact-creation-manager/listeners/auto-companies-and-contacts-creation-message-channel.listener';
import { CreateCompanyAndContactService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/services/create-company.service';
import { CreateContactService } from 'src/modules/contact-creation-manager/services/create-contact.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([WorkspaceMemberWorkspaceEntity]),
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
  ],
  providers: [
    CreateCompanyService,
    CreateContactService,
    CreateCompanyAndContactService,
    AutoCompaniesAndContactsCreationMessageChannelListener,
    AutoCompaniesAndContactsCreationCalendarChannelListener,
  ],
  exports: [CreateCompanyAndContactService],
})
export class ContactCreationManagerModule {}
