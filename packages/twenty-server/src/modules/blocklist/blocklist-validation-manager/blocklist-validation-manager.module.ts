import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { BlocklistValidationService } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      BlocklistWorkspaceEntity,
      WorkspaceMemberWorkspaceEntity,
    ]),
  ],
  providers: [BlocklistValidationService],
  exports: [BlocklistValidationService],
})
export class BlocklistValidationManagerModule {}
