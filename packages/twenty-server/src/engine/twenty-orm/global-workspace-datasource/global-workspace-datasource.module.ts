import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceFeatureFlagsMapCacheModule } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { RedisFieldsDataSource } from 'src/engine/twenty-orm/datasource/redis-fields-data-source.service';
import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { RedisFieldSqlFactory } from 'src/engine/twenty-orm/factories/redis-field-sql.factory';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import { RedisFieldRepository } from 'src/engine/twenty-orm/repository/redis-fields.repository';
import { RedisStorageDriver } from 'src/engine/twenty-orm/storage/drivers/redis-storage.driver';
import { ExternalFieldDriversProvider } from 'src/engine/twenty-orm/storage/external-field-drivers.provider';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataCacheModule,
    WorkspacePermissionsCacheModule,
    WorkspaceFeatureFlagsMapCacheModule,
    FeatureFlagModule,
    TwentyConfigModule,
    WorkspaceEventEmitterModule,
  ],
  providers: [
    GlobalWorkspaceDataSourceService,
    GlobalWorkspaceOrmManager,
    EntitySchemaFactory,
    EntitySchemaColumnFactory,
    EntitySchemaRelationFactory,
    RedisFieldRepository,
    RedisFieldsDataSource,
    RedisStorageDriver,
    RedisFieldSqlFactory,
    ExternalFieldDriversProvider,
  ],
  exports: [GlobalWorkspaceDataSourceService, GlobalWorkspaceOrmManager],
})
export class GlobalWorkspaceDataSourceModule {}
