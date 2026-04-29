import { Module } from '@nestjs/common';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    WorkspaceCacheStorageModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TokenModule,
    JwtModule,
    AuthModule,
  ],
  providers: [MiddlewareService],
  exports: [MiddlewareService],
})
export class MiddlewareModule {}
