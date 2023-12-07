import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationModule } from 'src/metadata/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceSyncMetadataService } from 'src/workspace/workspace-sync-metadata/workspace-sync.metadata.service';

@Module({
  imports: [
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    TypeOrmModule.forFeature(
      [
        FieldMetadataEntity,
        ObjectMetadataEntity,
        RelationMetadataEntity,
        WorkspaceMigrationEntity,
      ],
      'metadata',
    ),
  ],
  exports: [WorkspaceSyncMetadataService],
  providers: [WorkspaceSyncMetadataService],
})
export class WorkspaceSyncMetadataModule {}
