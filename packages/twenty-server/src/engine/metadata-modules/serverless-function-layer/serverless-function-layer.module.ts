import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { ServerlessFunctionLayerResolver } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.resolver';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';

@Module({
  imports: [
    PermissionsModule,
    TypeOrmModule.forFeature([ServerlessFunctionLayerEntity]),
  ],
  providers: [ServerlessFunctionLayerService, ServerlessFunctionLayerResolver],
  exports: [ServerlessFunctionLayerService],
})
export class ServerlessFunctionLayerModule {}
