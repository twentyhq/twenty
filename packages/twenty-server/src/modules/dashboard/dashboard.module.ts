import { Module } from '@nestjs/common';

import { PageLayoutModule } from 'src/engine/core-modules/page-layout/page-layout.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { DashboardResolver } from 'src/modules/dashboard/resolvers/dashboard.resolver';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';

@Module({
  imports: [PageLayoutModule, TwentyORMModule],
  providers: [DashboardDuplicationService, DashboardResolver],
  exports: [DashboardDuplicationService],
})
export class DashboardModule {}
