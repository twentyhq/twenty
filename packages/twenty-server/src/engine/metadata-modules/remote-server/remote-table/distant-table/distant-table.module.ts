import { Module } from '@nestjs/common';

import { DistantTableService } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [DistantTableService],
  exports: [DistantTableService],
})
export class DistantTableModule {}
