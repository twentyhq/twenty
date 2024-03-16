import { Module } from '@nestjs/common';

import { CreateCompanyAndContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.service';
import { CreateCompanyModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company/create-company.module';
import { CreateContactModule } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-contact/create-contact.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository.module';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    CreateContactModule,
    CreateCompanyModule,
    ObjectMetadataRepositoryModule.forFeature([
      PersonObjectMetadata,
      WorkspaceMemberObjectMetadata,
    ]),
  ],
  providers: [CreateCompanyAndContactService],
  exports: [CreateCompanyAndContactService],
})
export class CreateCompaniesAndContactsModule {}
