import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { LogicFunctionLayerResolver } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.resolver';
import { WorkspaceLogicFunctionLayerMapCacheService } from 'src/engine/metadata-modules/logic-function-layer/services/workspace-logic-function-layer-map-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionLayerEntity]),
    PermissionsModule,
  ],
  providers: [
    LogicFunctionLayerResolver,
    WorkspaceLogicFunctionLayerMapCacheService,
  ],
  exports: [WorkspaceLogicFunctionLayerMapCacheService],
})
export class LogicFunctionLayerModule {}
