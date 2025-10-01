import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';
import { ServerlessFunctionLayerResolver } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ServerlessFunctionLayerEntity])],
  providers: [ServerlessFunctionLayerService, ServerlessFunctionLayerResolver],
  exports: [ServerlessFunctionLayerService],
})
export class ServerlessFunctionLayerModule {}
