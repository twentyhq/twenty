import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewGroupController } from 'src/engine/metadata-modules/view-group/controllers/view-group.controller';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewGroupResolver } from 'src/engine/metadata-modules/view-group/resolvers/view-group.resolver';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewGroupEntity]),
    WorkspaceCacheStorageModule,
  ],
  controllers: [ViewGroupController],
  providers: [ViewGroupService, ViewGroupResolver],
  exports: [ViewGroupService],
})
export class ViewGroupModule {}
