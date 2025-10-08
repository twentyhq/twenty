import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewFilterGroupController } from 'src/engine/metadata-modules/view-filter-group/controllers/view-filter-group.controller';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterGroupResolver } from 'src/engine/metadata-modules/view-filter-group/resolvers/view-filter-group.resolver';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewCoreModule } from 'src/engine/metadata-modules/view/view-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([ViewFilterGroupEntity]), ViewCoreModule],
  controllers: [ViewFilterGroupController],
  providers: [ViewFilterGroupService, ViewFilterGroupResolver],
  exports: [ViewFilterGroupService],
})
export class ViewFilterGroupModule {}
