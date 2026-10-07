import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceFlatConnectionProviderMapCacheService } from 'src/engine/metadata-modules/flat-connection-provider/services/workspace-flat-connection-provider-map-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, ConnectionProviderEntity]),
  ],
  providers: [WorkspaceFlatConnectionProviderMapCacheService],
  exports: [WorkspaceFlatConnectionProviderMapCacheService],
})
export class FlatConnectionProviderModule {}
