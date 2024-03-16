import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { CreateContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-contact/create-contact.service';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([PersonObjectMetadata]),
  ],
  providers: [CreateContactService],
  exports: [CreateContactService],
})
export class CreateContactModule {}
