import { Module } from '@nestjs/common';

import { RemotePostgresTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-postgres-table/remote-postgres-table.service';

@Module({
  providers: [RemotePostgresTableService],
  exports: [RemotePostgresTableService],
})
export class RemotePostgresTableModule {}
