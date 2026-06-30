import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { WorkspaceDataSourceService } from './workspace-datasource.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity]), TypeORMModule],
  exports: [WorkspaceDataSourceService],
  providers: [WorkspaceDataSourceService],
})
export class WorkspaceDataSourceModule {}
