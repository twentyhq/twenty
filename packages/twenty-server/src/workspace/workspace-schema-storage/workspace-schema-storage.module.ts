import { Module } from '@nestjs/common';

import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { WorkspaceCacheVersionModule } from 'src/metadata/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceSchemaStorageService } from 'src/workspace/workspace-schema-storage/workspace-schema-storage.service';

@Module({
  imports: [ObjectMetadataModule, WorkspaceCacheVersionModule],
  providers: [WorkspaceSchemaStorageService],
  exports: [WorkspaceSchemaStorageService],
})
export class WorkspaceSchemaStorageModule {}
