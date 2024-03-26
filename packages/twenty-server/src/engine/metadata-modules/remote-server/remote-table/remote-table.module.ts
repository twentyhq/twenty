import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteTableResolver } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.resolver';
import { RemoteTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RemoteServerEntity], 'metadata'),
    WorkspaceDataSourceModule,
  ],
  providers: [RemoteTableService, RemoteTableResolver],
})
export class RemoteTableModule {}
