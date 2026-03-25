import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSourceEntity } from './data-source.entity';
import { DataSourceService } from './data-source.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataSourceEntity])],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
