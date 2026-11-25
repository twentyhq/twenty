import { Module } from '@nestjs/common';

import { UserWorkspaceSuccessorModule } from 'src/engine/core-modules/user-workspace/user-workspace-successor.module';
import { PrivateMetadataSuccessorTransferService } from 'src/engine/permissions/metadata-permissions/services/private-metadata-successor-transfer.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [UserWorkspaceSuccessorModule, WorkspaceCacheModule],
  providers: [PrivateMetadataSuccessorTransferService],
  exports: [PrivateMetadataSuccessorTransferService],
})
export class PrivateMetadataSuccessorTransferModule {}
