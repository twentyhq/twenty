import { Module } from '@nestjs/common';

import { BlocklistService } from 'src/workspace/messaging/repositories/blocklist/blocklist.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [BlocklistService],
  exports: [BlocklistService],
})
export class BlocklistModule {}
