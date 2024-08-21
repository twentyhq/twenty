import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceCacheStorageModule,
  ],
  exports: [WorkspaceMetadataVersionService],
  providers: [WorkspaceMetadataVersionService],
})
export class WorkspaceMetadataVersionModule {}
