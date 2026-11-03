import { Module } from '@nestjs/common';

import { DirectMessageFileAccessService } from 'src/engine/permissions/direct-message/services/direct-message-file-access.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [DirectMessageFileAccessService],
  exports: [DirectMessageFileAccessService],
})
export class DirectMessageFileAccessModule {}
