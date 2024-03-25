import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

import { WorkspaceDataSourceService } from './workspace-datasource.service';

@Module({
  imports: [DataSourceModule, TypeORMModule],
  exports: [WorkspaceDataSourceService],
  providers: [WorkspaceDataSourceService],
})
export class WorkspaceDataSourceModule {}
