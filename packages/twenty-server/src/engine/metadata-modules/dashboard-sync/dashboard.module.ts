import { Module } from '@nestjs/common';

import { DashboardSyncService } from 'src/engine/metadata-modules/dashboard-sync/services/dashboard-sync.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [TwentyORMModule, WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [DashboardSyncService],
  exports: [DashboardSyncService],
})
export class DashboardSyncModule {}
