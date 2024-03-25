import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ForeignDataWrapperQueryFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/foreign-data-wrapper-query.factory';
import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteServerResolver } from 'src/engine/metadata-modules/remote-server/remote-server.resolver';
import { RemoteServerService } from 'src/engine/metadata-modules/remote-server/remote-server.service';

@Module({
  imports: [
    TypeORMModule,
    TypeOrmModule.forFeature([RemoteServerEntity], 'metadata'),
  ],
  providers: [
    RemoteServerService,
    RemoteServerResolver,
    ForeignDataWrapperQueryFactory,
  ],
  exports: [RemoteServerService],
})
export class RemoteServerModule {}
