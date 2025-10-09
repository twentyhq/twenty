import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewSortController } from 'src/engine/metadata-modules/view-sort/controllers/view-sort.controller';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewSortResolver } from 'src/engine/metadata-modules/view-sort/resolvers/view-sort.resolver';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ViewSortEntity]),
    WorkspaceCacheStorageModule,
  ],
  controllers: [ViewSortController],
  providers: [ViewSortService, ViewSortResolver],
  exports: [ViewSortService],
})
export class ViewSortModule {}
