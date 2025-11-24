import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceFeatureFlagsMapCacheModule } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
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
  ],
  exports: [GlobalWorkspaceDataSourceService, GlobalWorkspaceOrmManager],
})
export class GlobalWorkspaceDataSourceModule {}
