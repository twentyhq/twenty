import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { EntityMetadataMemoryAnalyzerCommand } from 'src/engine/workspace-cache/commands/entity-metadata-memory-analyzer.command';
import { EntityMetadataRetentionAnalyzerCommand } from 'src/engine/workspace-cache/commands/entity-metadata-retention-analyzer.command';
import { TypeORMMemoryProfilerCommand } from 'src/engine/workspace-cache/commands/typeorm-memory-profiler.command';
import { WorkspaceCacheMemoryLeakValidatorCommand } from 'src/engine/workspace-cache/commands/workspace-cache-memory-leak-validator.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
    ]),
    DataSourceModule,
    WorkspaceCacheModule,
    TwentyORMModule,
  ],
  providers: [
    WorkspaceCacheMemoryLeakValidatorCommand,
    TypeORMMemoryProfilerCommand,
    EntityMetadataMemoryAnalyzerCommand,
    EntityMetadataRetentionAnalyzerCommand,
  ],
})
export class WorkspaceCacheCommandsModule {}
