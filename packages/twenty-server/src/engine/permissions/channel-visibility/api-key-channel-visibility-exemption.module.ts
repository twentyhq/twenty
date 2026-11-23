import { Module } from '@nestjs/common';

import { ApiKeyChannelVisibilityExemptionService } from 'src/engine/permissions/channel-visibility/services/api-key-channel-visibility-exemption.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [ApiKeyChannelVisibilityExemptionService],
  exports: [ApiKeyChannelVisibilityExemptionService],
})
export class ApiKeyChannelVisibilityExemptionModule {}
