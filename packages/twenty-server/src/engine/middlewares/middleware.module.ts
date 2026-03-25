import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    DataSourceModule,
    WorkspaceCacheStorageModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TokenModule,
    JwtModule,
  ],
  providers: [MiddlewareService],
  exports: [MiddlewareService],
})
export class MiddlewareModule {}
