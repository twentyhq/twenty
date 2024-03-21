import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { RemoteServerEntity } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteServerResolver } from 'src/engine/metadata-modules/remote-server/remote-server.resolver';
import { RemoteServerService } from 'src/engine/metadata-modules/remote-server/remote-server.service';

@Module({
  imports: [
    TypeORMModule,
    TypeOrmModule.forFeature([RemoteServerEntity], 'metadata'),
  ],
  providers: [RemoteServerService, RemoteServerResolver],
  exports: [RemoteServerService],
})
export class RemoteServerModule {}
