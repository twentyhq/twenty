import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewFilterController } from 'src/engine/metadata-modules/view-filter/controllers/view-filter.controller';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewFilterResolver } from 'src/engine/metadata-modules/view-filter/resolvers/view-filter.resolver';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';

@Module({
  imports: [TypeOrmModule.forFeature([ViewFilterEntity]), ViewModule],
  controllers: [ViewFilterController],
  providers: [ViewFilterService, ViewFilterResolver],
  exports: [ViewFilterService],
})
export class ViewFilterModule {}
