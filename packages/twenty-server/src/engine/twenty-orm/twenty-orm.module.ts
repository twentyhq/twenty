import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceBillingEntitlementsCacheModule } from 'src/engine/core-modules/billing/workspace-billing-entitlements-cache.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceFeatureFlagsMapCacheModule } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.module';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceDataSourceService } from 'src/engine/twenty-orm/datasource/workspace-data-source.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Global()
@Module({
  imports: [
    TypeORMModule,
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      ApplicationEntity,
      FeatureFlagEntity,
    ]),
    WorkspaceFeatureFlagsMapCacheModule,
    WorkspaceBillingEntitlementsCacheModule,
    UsageLimitModule,
    WorkspaceCacheModule,
  ],
  providers: [
    WorkspaceOrmManager,
    WorkspaceDataSourceService,
    provideWorkspaceScopedRepository(FeatureFlagEntity),
  ],
  exports: [WorkspaceOrmManager],
})
export class TwentyOrmModule {}
