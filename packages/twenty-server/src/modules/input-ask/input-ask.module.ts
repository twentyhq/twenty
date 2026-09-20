import { Module } from '@nestjs/common';

import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';

@Module({
  imports: [RecordPositionModule],
  providers: [InputAskWorkspaceService],
  exports: [InputAskWorkspaceService],
})
export class InputAskModule {}
