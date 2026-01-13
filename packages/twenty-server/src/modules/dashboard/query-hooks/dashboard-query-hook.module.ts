import { Module } from '@nestjs/common';

import { PageLayoutTabModule } from 'src/engine/metadata-modules/page-layout-tab/page-layout-tab.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { DashboardCreateManyPreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-create-many.pre-query.hook';
import { DashboardCreateOnePreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-create-one.pre-query.hook';
import { DashboardDestroyManyPreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-destroy-many.pre-query.hook';
import { DashboardDestroyOnePreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-destroy-one.pre-query.hook';
import { DashboardToPageLayoutSyncService } from 'src/modules/dashboard/services/dashboard-to-page-layout-sync.service';

@Module({
  imports: [PageLayoutModule, PageLayoutTabModule, TwentyORMModule],
  providers: [
    DashboardToPageLayoutSyncService,
    DashboardCreateOnePreQueryHook,
    DashboardCreateManyPreQueryHook,
    DashboardDestroyOnePreQueryHook,
    DashboardDestroyManyPreQueryHook,
  ],
})
export class DashboardQueryHookModule {}
