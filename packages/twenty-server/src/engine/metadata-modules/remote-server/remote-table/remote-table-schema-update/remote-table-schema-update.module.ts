import { Module } from '@nestjs/common';

import { RemoteTableSchemaUpdateService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-schema-update/remote-table-schema-update.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [RemoteTableSchemaUpdateService],
  exports: [RemoteTableSchemaUpdateService],
})
export class RemoteTableSchemaUpdateModule {}
