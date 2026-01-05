import { Module } from '@nestjs/common';

import { DashboardTimestampService } from 'src/engine/metadata-modules/dashboard/services/dashboard-timestamp.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [TwentyORMModule, WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [DashboardTimestampService],
  exports: [DashboardTimestampService],
})
export class DashboardModule {}
