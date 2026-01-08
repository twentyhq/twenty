import { Module } from '@nestjs/common';

import { PageLayoutTabModule } from 'src/engine/metadata-modules/page-layout-tab/page-layout-tab.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { DashboardCreateManyPreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-create-many.pre-query.hook';
import { DashboardCreateOnePreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-create-one.pre-query.hook';
import { DashboardDeleteManyPreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-delete-many.pre-query.hook';
import { DashboardDeleteOnePreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-delete-one.pre-query.hook';
import { DashboardDestroyManyPreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-destroy-many.pre-query.hook';
import { DashboardDestroyOnePreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-destroy-one.pre-query.hook';
import { DashboardRestoreManyPreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-restore-many.pre-query.hook';
import { DashboardRestoreOnePreQueryHook } from 'src/modules/dashboard/query-hooks/dashboard-restore-one.pre-query.hook';
import { DashboardPageLayoutService } from 'src/modules/dashboard/services/dashboard-page-layout.service';

@Module({
  imports: [PageLayoutModule, PageLayoutTabModule],
  providers: [
    DashboardPageLayoutService,
    DashboardCreateOnePreQueryHook,
    DashboardCreateManyPreQueryHook,
    DashboardDeleteOnePreQueryHook,
    DashboardDeleteManyPreQueryHook,
    DashboardRestoreOnePreQueryHook,
    DashboardRestoreManyPreQueryHook,
    DashboardDestroyOnePreQueryHook,
    DashboardDestroyManyPreQueryHook,
  ],
})
export class DashboardQueryHookModule {}
