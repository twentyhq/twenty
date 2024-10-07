import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { entitySchemaFactories } from 'src/engine/twenty-orm/factories';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    DataSourceModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataCacheModule,
  ],
  providers: [
    ...entitySchemaFactories,
    TwentyORMManager,
    TwentyORMGlobalManager,
  ],
  exports: [EntitySchemaFactory, TwentyORMManager, TwentyORMGlobalManager],
})
export class TwentyORMModule {}
