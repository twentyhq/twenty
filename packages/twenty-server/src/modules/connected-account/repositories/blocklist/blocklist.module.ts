import { Module } from '@nestjs/common';

import { BlocklistService } from 'src/modules/connected-account/repositories/blocklist/blocklist.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [BlocklistService],
  exports: [BlocklistService],
})
export class BlocklistModule {}
