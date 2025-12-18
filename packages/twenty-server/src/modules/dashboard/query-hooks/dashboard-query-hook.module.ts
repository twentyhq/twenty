import { Module } from '@nestjs/common';

import { PageLayoutTabModule } from 'src/engine/metadata-modules/page-layout-tab/page-layout-tab.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { DashboardCreateOnePreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-create-one.pre-query.hook';

@Module({
  imports: [PageLayoutModule, PageLayoutTabModule],
  providers: [DashboardCreateOnePreQueryHook],
})
export class DashboardQueryHookModule {}
