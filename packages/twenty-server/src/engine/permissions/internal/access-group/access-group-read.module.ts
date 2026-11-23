import { Module } from '@nestjs/common';

import { ApiKeyChannelVisibilityExemptionModule } from 'src/engine/permissions/channel-visibility/api-key-channel-visibility-exemption.module';
import { AccessGroupReadService } from 'src/engine/permissions/internal/access-group/services/access-group-read.service';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ApiKeyChannelVisibilityExemptionModule,
    RecordPermissionRepositoryModule,
    WorkspaceCacheModule,
  ],
  providers: [AccessGroupReadService],
  exports: [AccessGroupReadService],
})
export class AccessGroupReadModule {}
