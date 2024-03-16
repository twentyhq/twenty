import { Module } from '@nestjs/common';

import { MessageParticipantRepository } from 'src/modules/messaging/repositories/message-participant/message-participant.repository';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository.module';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([PersonObjectMetadata]),
  ],
  providers: [MessageParticipantRepository],
  exports: [MessageParticipantRepository],
})
export class MessageParticipantModule {}
