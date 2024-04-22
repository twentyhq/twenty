import { Module } from '@nestjs/common';

import { RemotePostgresTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-postgres-table/remote-postgres-table.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [RemotePostgresTableService],
  exports: [RemotePostgresTableService],
})
export class RemotePostgresTableModule {}
