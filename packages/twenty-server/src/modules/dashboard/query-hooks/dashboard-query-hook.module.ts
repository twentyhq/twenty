import { Module } from '@nestjs/common';

import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { DashboardCreateOnePreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-create-one.pre-query.hook';

@Module({
  imports: [PageLayoutModule],
  providers: [DashboardCreateOnePreQueryHook],
})
export class DashboardQueryHookModule {}
