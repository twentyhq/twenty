import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { LogicFunctionLayerResolver } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.resolver';
import { LogicFunctionLayerService } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.service';
import { WorkspaceLogicFunctionLayerMapCacheService } from 'src/engine/metadata-modules/logic-function-layer/services/workspace-logic-function-layer-map-cache.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    PermissionsModule,
    TypeOrmModule.forFeature([LogicFunctionLayerEntity]),
    WorkspaceCacheModule,
  ],
  providers: [
    LogicFunctionLayerService,
    LogicFunctionLayerResolver,
    WorkspaceLogicFunctionLayerMapCacheService,
  ],
  exports: [
    LogicFunctionLayerService,
    WorkspaceLogicFunctionLayerMapCacheService,
  ],
})
export class LogicFunctionLayerModule {}
