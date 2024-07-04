import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateCompanyAndContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/services/create-company-and-contact.service';
import { CreateCompanyModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company/create-company.module';
import { CreateContactModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-contact/create-contact.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { AutoCompaniesAndContactsCreationMessageChannelListener } from 'src/modules/connected-account/auto-companies-and-contacts-creation/listeners/auto-companies-and-contacts-creation-message-channel.listener';
import { AutoCompaniesAndContactsCreationCalendarChannelListener } from 'src/modules/connected-account/auto-companies-and-contacts-creation/listeners/auto-companies-and-contacts-creation-calendar-channel.listener';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Module({
  imports: [
    CreateContactModule,
    CreateCompanyModule,
    ObjectMetadataRepositoryModule.forFeature([
      PersonWorkspaceEntity,
      WorkspaceMemberWorkspaceEntity,
    ]),
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
  ],
  providers: [
    CreateCompanyAndContactService,
    AutoCompaniesAndContactsCreationMessageChannelListener,
    AutoCompaniesAndContactsCreationCalendarChannelListener,
  ],
  exports: [CreateCompanyAndContactService],
})
export class AutoCompaniesAndContactsCreationModule {}
