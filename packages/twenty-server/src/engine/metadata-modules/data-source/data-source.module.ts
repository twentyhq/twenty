import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { DataSourceEntity } from './data-source.entity';
import { DataSourceService } from './data-source.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataSourceEntity, WorkspaceEntity])],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
