import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceFlatFrontComponentMapCacheService } from 'src/engine/metadata-modules/flat-front-component/services/workspace-flat-front-component-map-cache.service';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, FrontComponentEntity]),
  ],
  providers: [WorkspaceFlatFrontComponentMapCacheService],
  exports: [WorkspaceFlatFrontComponentMapCacheService],
})
export class FlatFrontComponentModule {}
