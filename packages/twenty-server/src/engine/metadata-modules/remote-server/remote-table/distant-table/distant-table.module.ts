import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { DistantTableService } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    TypeOrmModule.forFeature([RemoteServerEntity]),
  ],
  providers: [DistantTableService],
  exports: [DistantTableService],
})
export class DistantTableModule {}
