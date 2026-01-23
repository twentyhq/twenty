import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { ServerlessFunctionLayerResolver } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.resolver';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';
import { WorkspaceServerlessFunctionLayerMapCacheService } from 'src/engine/metadata-modules/serverless-function-layer/services/workspace-serverless-function-layer-map-cache.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    PermissionsModule,
    TypeOrmModule.forFeature([ServerlessFunctionLayerEntity]),
    WorkspaceCacheModule,
  ],
  providers: [
    ServerlessFunctionLayerService,
    ServerlessFunctionLayerResolver,
    WorkspaceServerlessFunctionLayerMapCacheService,
  ],
  exports: [
    ServerlessFunctionLayerService,
    WorkspaceServerlessFunctionLayerMapCacheService,
  ],
})
export class ServerlessFunctionLayerModule {}
