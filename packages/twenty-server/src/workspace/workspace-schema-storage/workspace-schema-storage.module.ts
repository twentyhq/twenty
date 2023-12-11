import { Module } from '@nestjs/common';

import { MemoryStorageDriverType } from 'src/integrations/memory-storage/interfaces';
import { MemoryStorageModule } from 'src/integrations/memory-storage/memory-storage.module';
import { MemoryStorageJsonSerializer } from 'src/integrations/memory-storage/serializers/json.serializer';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { WorkspaceCacheVersionModule } from 'src/metadata/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceSchemaStorageService } from 'src/workspace/workspace-schema-storage/workspace-schema-storage.service';

@Module({
  imports: [
    ObjectMetadataModule,
    WorkspaceCacheVersionModule,
    MemoryStorageModule.forRoot({
      identifier: 'objectMetadataCollection',
      type: MemoryStorageDriverType.Local,
      options: {},
      serializer: new MemoryStorageJsonSerializer<ObjectMetadataEntity[]>(),
    }),
    MemoryStorageModule.forRoot({
      identifier: 'typeDefs',
      type: MemoryStorageDriverType.Local,
      options: {},
    }),
    MemoryStorageModule.forRoot({
      identifier: 'usedScalarNames',
      type: MemoryStorageDriverType.Local,
      options: {},
      serializer: new MemoryStorageJsonSerializer<string[]>(),
    }),
    MemoryStorageModule.forRoot({
      identifier: 'cacheVersion',
      type: MemoryStorageDriverType.Local,
      options: {},
    }),
  ],
  providers: [WorkspaceSchemaStorageService],
  exports: [WorkspaceSchemaStorageService],
})
export class WorkspaceSchemaStorageModule {}
