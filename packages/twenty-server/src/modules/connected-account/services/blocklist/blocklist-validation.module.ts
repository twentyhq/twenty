import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { BlocklistValidationService } from 'src/modules/connected-account/services/blocklist/blocklist-validation.service';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      BlocklistObjectMetadata,
      WorkspaceMemberObjectMetadata,
    ]),
  ],
  providers: [BlocklistValidationService],
  exports: [BlocklistValidationService],
})
export class BlocklistValidationModule {}
