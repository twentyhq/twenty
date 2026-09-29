import { Module } from '@nestjs/common';

import { RecordShareModule } from 'src/engine/core-modules/record-share/record-share.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { RecordPermissionsResolver } from 'src/engine/metadata-modules/record-permissions/record-permissions.resolver';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [RecordShareModule, AiChatModule, WorkspaceCacheModule],
  providers: [RecordPermissionsResolver],
})
export class RecordPermissionsModule {}
