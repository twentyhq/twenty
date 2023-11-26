import { Module } from '@nestjs/common';

import { MemoryStorageType } from 'src/integrations/environment/interfaces/memory-storage.interface';

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
      type: MemoryStorageType.Local,
      options: {},
      serializer: new MemoryStorageJsonSerializer<ObjectMetadataEntity[]>(),
    }),
    MemoryStorageModule.forRoot({
      identifier: 'typeDefs',
      type: MemoryStorageType.Local,
      options: {},
    }),
    MemoryStorageModule.forRoot({
      identifier: 'usedScalarNames',
      type: MemoryStorageType.Local,
      options: {},
      serializer: new MemoryStorageJsonSerializer<string[]>(),
    }),
    MemoryStorageModule.forRoot({
      identifier: 'cacheVersion',
      type: MemoryStorageType.Local,
      options: {},
    }),
  ],
  providers: [WorkspaceSchemaStorageService],
  exports: [WorkspaceSchemaStorageService],
})
export class WorkspaceSchemaStorageModule {}
