import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewGroupController } from 'src/engine/metadata-modules/view-group/controllers/view-group.controller';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewGroupResolver } from 'src/engine/metadata-modules/view-group/resolvers/view-group.resolver';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { ViewCoreModule } from 'src/engine/metadata-modules/view/view-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([ViewGroupEntity]), ViewCoreModule],
  controllers: [ViewGroupController],
  providers: [ViewGroupService, ViewGroupResolver],
  exports: [ViewGroupService],
})
export class ViewGroupModule {}
