import { Global, Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceBillingEntitlementsCacheModule } from 'src/engine/core-modules/billing/workspace-billing-entitlements-cache.module';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { WorkspaceFeatureFlagsMapCacheModule } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.module';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceDataSourceService } from 'src/engine/twenty-orm/datasource/workspace-data-source.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Global()
@Module({
  imports: [
    TypeORMModule,
    WorkspaceFeatureFlagsMapCacheModule,
    WorkspaceBillingEntitlementsCacheModule,
    UsageLimitModule,
    WorkspaceCacheModule,
  ],
  providers: [WorkspaceOrmManager, WorkspaceDataSourceService],
  exports: [WorkspaceOrmManager],
})
export class TwentyOrmModule {}
