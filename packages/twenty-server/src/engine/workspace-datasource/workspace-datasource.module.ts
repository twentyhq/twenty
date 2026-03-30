import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

import { WorkspaceDataSourceService } from './workspace-datasource.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    TypeORMModule,
    FeatureFlagModule,
    DataSourceModule,
  ],
  exports: [WorkspaceDataSourceService],
  providers: [WorkspaceDataSourceService],
})
export class WorkspaceDataSourceModule {}
