import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';

@Module({
  imports: [TwentyORMModule, WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [DashboardSyncService],
  exports: [DashboardSyncService],
})
export class DashboardSyncModule {}
