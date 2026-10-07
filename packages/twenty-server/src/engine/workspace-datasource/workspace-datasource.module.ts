import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { WorkspaceSchemaService } from './workspace-schema.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity])],
  exports: [WorkspaceSchemaService],
  providers: [WorkspaceSchemaService],
})
export class WorkspaceDataSourceModule {}
