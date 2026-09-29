import { Module } from '@nestjs/common';

import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';

@Module({
  imports: [RecordPositionModule, WorkspaceCacheModule],
  providers: [InputAskWorkspaceService],
  exports: [InputAskWorkspaceService],
})
export class InputAskModule {}
