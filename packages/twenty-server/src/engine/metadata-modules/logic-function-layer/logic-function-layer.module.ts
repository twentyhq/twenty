import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { LogicFunctionLayerResolver } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.resolver';
import { WorkspaceLogicFunctionLayerMapCacheService } from 'src/engine/metadata-modules/logic-function-layer/services/workspace-logic-function-layer-map-cache.service';

@Module({
  imports: [PermissionsModule],
  providers: [
    LogicFunctionLayerResolver,
    WorkspaceLogicFunctionLayerMapCacheService,
  ],
  exports: [WorkspaceLogicFunctionLayerMapCacheService],
})
export class LogicFunctionLayerModule {}
