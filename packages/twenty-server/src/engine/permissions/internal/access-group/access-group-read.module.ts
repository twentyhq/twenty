import { Module } from '@nestjs/common';

import { ApiKeyChannelVisibilityExemptionService } from 'src/engine/permissions/channel-visibility/services/api-key-channel-visibility-exemption.service';
import { AccessGroupReadService } from 'src/engine/permissions/internal/access-group/services/access-group-read.service';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [RecordPermissionRepositoryModule, WorkspaceCacheModule],
  providers: [AccessGroupReadService, ApiKeyChannelVisibilityExemptionService],
  exports: [AccessGroupReadService],
})
export class AccessGroupReadModule {}
