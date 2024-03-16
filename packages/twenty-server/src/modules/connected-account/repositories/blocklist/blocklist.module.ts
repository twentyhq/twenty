import { Module } from '@nestjs/common';

import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist/blocklist.repository';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [BlocklistRepository],
  exports: [BlocklistRepository],
})
export class BlocklistModule {}
