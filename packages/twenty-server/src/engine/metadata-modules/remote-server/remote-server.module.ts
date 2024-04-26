import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ForeignDataWrapperQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/foreign-data-wrapper-query.factory';
import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteServerResolver } from 'src/engine/metadata-modules/remote-server/remote-server.resolver';
import { RemoteServerService } from 'src/engine/metadata-modules/remote-server/remote-server.service';
import { RemoteTableModule } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RemoteServerEntity], 'metadata'),
    RemoteTableModule,
    WorkspaceDataSourceModule,
  ],
  providers: [
    RemoteServerService,
    RemoteServerResolver,
    ForeignDataWrapperQueryFactory,
  ],
})
export class RemoteServerModule {}
