import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { TypeORMMemoryProfilerCommand } from 'src/engine/workspace-cache/commands/typeorm-memory-profiler.command';
import { WorkspaceCacheMemoryLeakValidatorCommand } from 'src/engine/workspace-cache/commands/workspace-cache-memory-leak-validator.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceCacheModule,
  ],
  providers: [
    WorkspaceCacheMemoryLeakValidatorCommand,
    TypeORMMemoryProfilerCommand,
  ],
})
export class WorkspaceCacheCommandsModule {}
