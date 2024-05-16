import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { CreateContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-contact/create-contact.service';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Module({
  imports: [ObjectMetadataRepositoryModule.forFeature([PersonWorkspaceEntity])],
  providers: [CreateContactService],
  exports: [CreateContactService],
})
export class CreateContactModule {}
