import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { DataSourceEntity } from './data-source.entity';
import { DataSourceService } from './data-source.service';

// @deprecated - This module is deprecated. It is only kept because
// ObjectMetadataEntity still has a FK (dataSourceId) pointing to
// DataSourceEntity. Remove once the FK is dropped.
@Module({
  imports: [TypeOrmModule.forFeature([DataSourceEntity, WorkspaceEntity])],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourceModule {}
